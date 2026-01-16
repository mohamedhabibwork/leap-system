import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom, isObservable } from 'rxjs';
import { SessionService } from '../session.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * CombinedAuthGuard
 * 
 * Guard that supports both session cookie authentication and Bearer token authentication.
 * Tries session cookie first, then falls back to Bearer token if no session cookie is present.
 */
@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private readonly logger = new Logger(CombinedAuthGuard.name);

  constructor(
    private sessionService: SessionService,
    private jwtAuthGuard: JwtAuthGuard,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    // Try session cookie authentication first
    const sessionToken = this.extractSessionToken(request);
    
    this.logger.debug('CombinedAuthGuard checking authentication', {
      hasSessionToken: !!sessionToken,
      cookieName: this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session',
      cookies: request.cookies ? Object.keys(request.cookies) : [],
      hasAuthHeader: !!request.headers.authorization,
    });
    
    if (sessionToken) {
      try {
        const session = await this.sessionService.getSession(sessionToken);
        
        if (session && session.user) {
          // Check if session needs token refresh
          const needsRefresh = await this.sessionService.needsRefresh(sessionToken);
          if (needsRefresh) {
            try {
              // Attempt to refresh tokens in background
              this.sessionService.refreshSession(sessionToken).catch(error => {
                this.logger.warn(`Background token refresh failed: ${error.message}`);
              });
            } catch (error) {
              // Non-blocking
              this.logger.warn(`Failed to initiate token refresh: ${error.message}`);
            }
          }

          // Update last activity
          this.sessionService.updateSessionActivity(sessionToken).catch(error => {
            // Non-blocking
            this.logger.warn(`Failed to update session activity: ${error.message}`);
          });

          // Attach user and session to request
          request['user'] = session.user;
          request['session'] = session.sessions;
          request['sessionToken'] = sessionToken;

          this.logger.debug(`Session authentication successful for user ${session.user.id}`);
          return true;
        }
      } catch (error) {
        this.logger.debug(`Session authentication failed: ${error.message}, falling back to JWT`);
        // Fall through to JWT authentication
      }
    }

    // Fall back to JWT Bearer token authentication
    const hasAuthHeader = !!request.headers.authorization;
    
    if (!hasAuthHeader) {
      // No session cookie and no auth header - authentication required
      this.logger.debug('No session cookie or authorization header found');
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.debug('No session cookie found, trying JWT Bearer token authentication', {
      cookieName: this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session',
      availableCookies: request.cookies ? Object.keys(request.cookies) : [],
    });
    
    try {
      const result = this.jwtAuthGuard.canActivate(context);
      
      // Handle Promise or Observable return type
      if (isObservable(result)) {
        return firstValueFrom(result);
      }
      
      // If it's a Promise, await it
      if (result instanceof Promise) {
        return await result;
      }
      
      return result;
    } catch (error) {
      // Only log warning if there was an auth header (token was present but invalid)
      if (hasAuthHeader) {
        this.logger.warn(`JWT authentication failed: ${error.message}`);
      }
      throw new UnauthorizedException('Authentication required');
    }
  }

  /**
   * Extract session token from cookies
   */
  private extractSessionToken(request: Request): string | undefined {
    const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 
                       this.configService.get<string>('SESSION_COOKIE_NAME') || 
                       'leap_session';
    return request.cookies?.[cookieName];
  }
}
