import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom, isObservable } from 'rxjs';
import { SessionService } from '../session.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import type { EnvConfig } from '../../../config/env';

/**
 * CombinedAuthGuard
 * 
 * Guard that supports both Bearer token authentication and session cookie authentication.
 * Prioritizes Bearer token authentication first (for consistency across all endpoints),
 * then falls back to session cookie if no Bearer token is present.
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
    const hasAuthHeader = !!request.headers.authorization;
    
    // Prioritize Bearer token authentication first for consistency across all endpoints
    if (hasAuthHeader) {
      this.logger.debug('CombinedAuthGuard: Bearer token found, using JWT authentication', {
        hasAuthHeader: true,
        url: request.url,
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
        this.logger.warn(`JWT Bearer token authentication failed: ${error.message}`);
        // Re-throw the error from JWT guard (it has better error messages)
        throw error;
      }
    }

    // Fall back to session cookie authentication if no Bearer token is present
    const sessionToken = this.extractSessionToken(request);
    
    const envConfig = this.configService.get<EnvConfig>('env');
    const cookieName = envConfig?.SESSION_COOKIE_NAME || 'leap_session';
    
    this.logger.debug('CombinedAuthGuard: No Bearer token found, trying session cookie authentication', {
      hasSessionToken: !!sessionToken,
      cookieName,
      cookies: request.cookies ? Object.keys(request.cookies) : [],
      url: request.url,
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
        this.logger.debug(`Session authentication failed: ${error.message}`);
        throw new UnauthorizedException('Authentication required. Please provide a valid Bearer token.');
      }
    }

    // No Bearer token and no session cookie - authentication required
    this.logger.debug('No authentication method found (no Bearer token, no session cookie)');
    throw new UnauthorizedException('Authentication required. Please provide a valid Bearer token.');
  }

  /**
   * Extract session token from cookies
   */
  private extractSessionToken(request: Request): string | undefined {
    const envConfig = this.configService.get<EnvConfig>('env');
    const cookieName = envConfig?.SESSION_COOKIE_NAME || 'leap_session';
    return request.cookies?.[cookieName];
  }
}
