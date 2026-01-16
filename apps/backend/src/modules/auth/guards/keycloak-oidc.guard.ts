import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Request, Response } from 'express';
import { env, getBooleanEnv } from '../../../config/env';

@Injectable()
export class KeycloakOidcGuard extends AuthGuard('keycloak-oidc') {
  private readonly logger = new Logger(KeycloakOidcGuard.name);

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Check if this is a callback request (has authorization code)
    const isCallback = !!(request.query.code);
    const hasError = !!(request.query.error);

    // IMPORTANT: Even if route is public, we MUST process OIDC callbacks
    // Passport needs to exchange the code for tokens and call the verify callback
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If this is a callback, we MUST process it through Passport, even if route is public
    // Only skip Passport if it's NOT a callback and route is public
    if (isPublic && !isCallback && !hasError) {
      return true;
    }

    this.logger.debug('Keycloak OIDC Guard - Request check', {
      isCallback,
      hasError,
      error: request.query.error,
      errorDescription: request.query.error_description,
      url: request.url,
      queryKeys: Object.keys(request.query),
    });

    // Check if Keycloak OIDC is configured
    const issuer = this.configService.get<string>('keycloak.issuer') ||
                   this.configService.get<string>('KEYCLOAK_ISSUER') ||
                   '';
    // Check both the config path and direct env var, default to true if not set
    const oidcEnabled = this.configService.get<boolean>('keycloak.oidc.enabled') !== false &&
                       (this.configService.get<boolean>('keycloak.oidc.enabled') === true ||
                        getBooleanEnv(env.KEYCLOAK_OIDC_ENABLED, true));

    this.logger.debug('Keycloak OIDC Guard - Configuration check', {
      oidcEnabled,
      issuer: issuer ? 'set' : 'not set',
      configValue: this.configService.get<boolean>('keycloak.oidc.enabled'),
      envValue: env.KEYCLOAK_OIDC_ENABLED,
      url: request.url,
      isCallback,
    });

    if (!oidcEnabled || !issuer) {
      this.logger.warn('Keycloak OIDC is not configured - OIDC authentication will not work', {
        oidcEnabled,
        issuer: issuer ? 'set' : 'not set',
        configValue: this.configService.get<boolean>('keycloak.oidc.enabled'),
        envValue: env.KEYCLOAK_OIDC_ENABLED,
      });
      
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      
      // Redirect to frontend login with error instead of throwing
      // Use locale-aware path (default to 'en')
      response.redirect(`${frontendUrl}/en/login?error=keycloak_not_configured`);
      return false;
    }

    // Handle OAuth errors from Keycloak
    if (hasError) {
      this.logger.error('Keycloak returned an error', {
        error: request.query.error,
        errorDescription: request.query.error_description,
        errorUri: request.query.error_uri,
      });
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      const errorParam = request.query.error as string;
      response.redirect(`${frontendUrl}/en/login?error=${encodeURIComponent(errorParam)}`);
      return false;
    }

    // Call parent canActivate which will trigger Passport authentication
    // - If this is a callback (has code), Passport will exchange the code for tokens and call verify callback
    // - If this is not a callback, Passport will redirect to Keycloak authorization URL
    this.logger.debug('Calling Passport canActivate', {
      isCallback,
      hasCode: !!request.query.code,
      hasState: !!request.query.state,
      url: request.url,
    });
    
    try {
      const result = super.canActivate(context);
      
      // Log the result type for debugging
      if (result instanceof Promise) {
        return result.then(
          (resolved) => {
            this.logger.debug('Passport canActivate resolved:', { resolved, isCallback });
            return resolved;
          },
          (rejected) => {
            this.logger.error('Passport canActivate rejected:', { 
              rejected, 
              isCallback, 
              error: rejected?.message || rejected,
              stack: rejected?.stack,
            });
            throw rejected;
          }
        );
      }
      
      return result;
    } catch (error: any) {
      this.logger.error('Error in Passport canActivate:', {
        error: error?.message || error,
        stack: error?.stack,
        isCallback,
        url: request.url,
      });
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const isCallback = !!(request.query.code);

    // Log authentication attempt details
    this.logger.debug('OIDC handleRequest called', {
      hasError: !!err,
      hasUser: !!user,
      hasInfo: !!info,
      errorMessage: err?.message,
      infoMessage: info?.message,
      infoName: info?.name,
      url: request.url,
      isCallback,
      query: request.query,
    });

    // Handle different error scenarios
    if (err) {
      this.logger.error(`OIDC authentication error: ${err.message}`, {
        stack: err.stack,
        isCallback,
        query: request.query,
      });
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      if (!response.headersSent) {
        response.redirect(`${frontendUrl}/en/login?error=authentication_failed`);
        return null; // Return null to prevent further processing
      }
      // Headers already sent, can't redirect - return null instead of throwing
      return null;
    }

    if (!user) {
      let errorMessage = 'Unauthorized';
      
      if (info) {
        if (info.name === 'TokenExpiredError') {
          errorMessage = 'Token has expired';
          this.logger.warn('OIDC token expired', { isCallback });
        } else if (info.name === 'JsonWebTokenError') {
          errorMessage = 'Invalid token';
          this.logger.warn(`Invalid OIDC token: ${info.message}`, { isCallback });
        } else {
          errorMessage = info.message || 'OIDC authentication failed';
          this.logger.warn(`OIDC authentication failed: ${info.message || 'Unknown error'}`, {
            info,
            isCallback,
            query: request.query,
          });
        }
      } else {
        this.logger.warn('OIDC authentication failed: No user returned and no error info', {
          err,
          info,
          isCallback,
          query: request.query,
        });
      }

      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      if (!response.headersSent) {
        response.redirect(`${frontendUrl}/en/login?error=authentication_failed`);
        return null; // Return null to prevent further processing
      }
      // Headers already sent, can't redirect - return null instead of throwing
      return null;
    }

    // Explicitly attach user to request object (required for @CurrentUser() decorator)
    request.user = user;

    // Set session token if available (from strategy's verify callback)
    if (user.sessionToken) {
      request['sessionToken'] = user.sessionToken;
      this.logger.debug('Session token attached to request', {
        userId: user.id,
        sessionTokenPrefix: user.sessionToken.substring(0, 8) + '...',
      });
    } else {
      this.logger.warn('User authenticated but no session token found', {
        userId: user.id,
        email: user.email,
      });
    }

    this.logger.debug('OIDC authentication successful', {
      userId: user.id,
      email: user.email,
      hasSessionToken: !!user.sessionToken,
      isCallback,
    });

    return user;
  }

  /**
   * Override getAuthenticateOptions to customize OIDC flow
   */
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const query = request.query;

    const options: any = {
      // Pass state parameter for redirect URL if provided
      ...(query.state && { state: query.state as string }),
      // Pass any additional OAuth parameters
      ...query,
    };

    this.logger.debug('OIDC authentication options:', options);
    return options;
  }

  /**
   * Override logIn to ensure redirect happens
   */
  logIn<TRequest extends { logIn: Function }>(request: TRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      request.logIn({}, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
