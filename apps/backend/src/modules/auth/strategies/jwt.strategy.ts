import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenVerificationService } from '../token-verification.service';
import { Request } from 'express';
import { isDevelopment } from '../../../config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private tokenVerificationService: TokenVerificationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // We'll handle expiration in our verification
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true, // Get request to extract token
    });

    this.logger.log('JWT Strategy initialized with local token verification');
  }

  async validate(req: Request, payload: any) {
    try {
      // Extract the raw token from the request
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      
      if (!token) {
        this.logger.warn('No token provided in Authorization header');
        throw new UnauthorizedException('No token provided');
      }

      // Log token info in development (first 20 chars only for security)
      if (isDevelopment()) {
        this.logger.debug(`Validating token: ${token.substring(0, 20)}...`);
      }

      // Verify token using token verification service
      try {
        const verifiedPayload = await this.tokenVerificationService.verifyAccessToken(token);
        
        // Use verified payload if available, otherwise use decoded payload
        const tokenPayload = verifiedPayload || payload;
        
        if (!tokenPayload || (!tokenPayload.sub && !tokenPayload.userId)) {
          this.logger.error('Token payload is missing or invalid');
          throw new UnauthorizedException('Invalid token payload');
        }

        return this.validateLocalToken(tokenPayload);
      } catch (error) {
        // If verification service fails, try to use decoded payload as fallback
        if (payload && (payload.sub || payload.userId)) {
          try {
            return this.validateLocalToken(payload);
          } catch (localError) {
            this.logger.error(`Local token validation also failed: ${localError.message}`);
            throw new UnauthorizedException(`Token validation failed: ${localError.message}`);
          }
        } else {
          // Token couldn't be decoded at all
          throw new UnauthorizedException(`Token verification failed: ${error.message}`);
        }
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Token validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException(`Token validation failed: ${error.message}`);
    }
  }

  /**
   * Validate local JWT token (for backward compatibility during migration)
   */
  private validateLocalToken(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token payload is missing');
    }

    // Validate expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      
      if (now > payload.exp) {
        this.logger.warn(`Token expired ${Math.abs(timeUntilExpiry)} seconds ago`);
        throw new UnauthorizedException('Token expired');
      }
      
      // Log if token is close to expiry (within 5 minutes)
      if (timeUntilExpiry < 300) {
        this.logger.debug(`Token expires in ${timeUntilExpiry} seconds`);
      }
    }

    // Validate required fields
    if (!payload.sub && !payload.userId) {
      this.logger.error('Token payload missing user identifier (sub or userId)');
      throw new UnauthorizedException('Invalid token: missing user identifier');
    }

    const user = {
      sub: payload.sub || payload.userId,
      id: payload.sub || payload.userId,
      userId: payload.userId || payload.sub,
      email: payload.email,
      username: payload.username || payload.preferred_username,
      roleId: payload.roleId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      firstName: payload.firstName || payload.given_name,
      lastName: payload.lastName || payload.family_name,
      name: payload.name || `${payload.firstName || payload.given_name || ''} ${payload.lastName || payload.family_name || ''}`.trim(),
    };

    this.logger.debug(`Local token validated for user: ${user.id}`);
    return user;
  }
}
