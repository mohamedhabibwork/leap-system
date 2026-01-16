import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Request, Response } from 'express';

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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check if Keycloak OIDC is configured
    const issuer = this.configService.get<string>('keycloak.issuer') ||
                   this.configService.get<string>('KEYCLOAK_ISSUER') ||
                   '';
    const oidcEnabled = this.configService.get<boolean>('keycloak.oidc.enabled') === true;

    if (!oidcEnabled || !issuer) {
      this.logger.warn('Keycloak OIDC is not configured - OIDC authentication will not work');
      throw new UnauthorizedException('Keycloak OIDC is not configured');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Log authentication attempt details
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`OIDC authentication attempt for ${request.method} ${request.url}`);
    }

    // Handle different error scenarios
    if (err) {
      this.logger.error(`OIDC authentication error: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      let errorMessage = 'Unauthorized';
      
      if (info) {
        if (info.name === 'TokenExpiredError') {
          errorMessage = 'Token has expired';
          this.logger.warn('OIDC token expired');
        } else if (info.name === 'JsonWebTokenError') {
          errorMessage = 'Invalid token';
          this.logger.warn(`Invalid OIDC token: ${info.message}`);
        } else {
          errorMessage = info.message || 'OIDC authentication failed';
          this.logger.warn(`OIDC authentication failed: ${info.message || 'Unknown error'}`);
        }
      } else {
        this.logger.warn('OIDC authentication failed: No user returned and no error info');
      }

      throw new UnauthorizedException(errorMessage);
    }

    // Set session cookie if session token is available
    if (user.sessionToken && request['sessionToken']) {
      // Cookie will be set in controller, but we ensure it's available
      request['sessionToken'] = user.sessionToken;
    }

    return user;
  }

  /**
   * Override getAuthenticateOptions to customize OIDC flow
   */
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const query = request.query;

    return {
      // Pass state parameter for redirect URL
      state: query.state as string,
      // Pass any additional OAuth parameters
      ...query,
    };
  }
}
