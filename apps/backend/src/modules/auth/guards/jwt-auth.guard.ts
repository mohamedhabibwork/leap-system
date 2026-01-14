import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
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

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Log authentication attempt details
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Authentication attempt for ${request.method} ${request.url}`);
      if (authHeader) {
        this.logger.debug(`Authorization header present: ${authHeader.substring(0, 20)}...`);
      } else {
        this.logger.warn('No Authorization header found');
      }
    }

    // Handle different error scenarios
    if (err) {
      this.logger.error(`Authentication error: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      let errorMessage = 'Unauthorized';
      
      if (info) {
        if (info.name === 'TokenExpiredError') {
          errorMessage = 'Token has expired';
          this.logger.warn('Token expired');
        } else if (info.name === 'JsonWebTokenError') {
          errorMessage = 'Invalid token';
          this.logger.warn(`Invalid token: ${info.message}`);
        } else if (info.name === 'NotBeforeError') {
          errorMessage = 'Token not active yet';
          this.logger.warn('Token not active');
        } else {
          errorMessage = info.message || 'Authentication failed';
          this.logger.warn(`Authentication failed: ${info.message || 'Unknown error'}`);
        }
      } else {
        this.logger.warn('Authentication failed: No user returned and no error info');
      }

      throw new UnauthorizedException(errorMessage);
    }

    return user;
  }
}
