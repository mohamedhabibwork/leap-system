import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SessionService } from '../session.service';

/**
 * SessionAuthGuard
 * 
 * Guard that validates HTTP-only session cookies for authentication.
 * This guard checks for a valid session token in cookies and attaches
 * the user to the request object. It also automatically refreshes
 * tokens that are near expiry.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly logger = new Logger(SessionAuthGuard.name);

  constructor(
    private sessionService: SessionService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = this.extractSessionToken(request);

    if (!sessionToken) {
      throw new UnauthorizedException('No session token provided');
    }

    try {
      // Get session with user data
      const session = await this.sessionService.getSession(sessionToken);

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      // Check if session needs token refresh
      const needsRefresh = await this.sessionService.needsRefresh(sessionToken);
      if (needsRefresh) {
        try {
          // Attempt to refresh tokens in background
          this.sessionService.refreshSession(sessionToken).catch(error => {
            this.logger.warn(`Background token refresh failed: ${error.message}`);
          });
        } catch (error) {
          // Non-blocking - refresh failures shouldn't block the request
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

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Session validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  /**
   * Extract session token from cookies
   */
  private extractSessionToken(request: Request): string | undefined {
    // Get cookie name from config (defaults to 'leap_session')
    const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 
                       this.configService.get<string>('SESSION_COOKIE_NAME') || 
                       'leap_session';
    return request.cookies?.[cookieName];
  }
}
