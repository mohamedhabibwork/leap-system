import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';


export interface TokenPayload {
  sub?: string | number;
  userId?: string | number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  permissions?: string[];
  roleId?: number;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
  typ?: string;
  [key: string]: any;
}

@Injectable()
export class TokenVerificationService {
  private readonly logger = new Logger(TokenVerificationService.name);
  private readonly jwtSecret: string;
  private readonly clockTolerance: number;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.jwtSecret = this.configService.get<string>('jwt.secret') || '';
    this.clockTolerance = this.configService.get<number>('TOKEN_CLOCK_TOLERANCE') || 30; // 30 seconds
    
    if (!this.jwtSecret) {
      this.logger.warn('JWT secret not configured - token verification may fail');
    }
  }

  /**
   * Verify access token using JWT secret
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token using JWT secret
      const payload = this.jwtService.verify(token) as TokenPayload;
      
      // Validate token claims
      await this.validateTokenClaims(payload);
      
      this.logger.debug('Token verified successfully');
      return payload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        this.logger.warn('Token has expired');
        throw new UnauthorizedException('Token has expired. Please refresh your session.');
      } else if (error.name === 'JsonWebTokenError') {
        this.logger.warn(`Invalid token: ${error.message}`);
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      } else if (error instanceof UnauthorizedException) {
        throw error; // Re-throw our custom exceptions
      }
      
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Token verification failed. Please sign in again.');
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(refreshToken: string): Promise<boolean> {
    if (!refreshToken) {
      return false;
    }

    try {
      // Verify refresh token using JWT secret
      this.jwtService.verify(refreshToken);
      return true;
    } catch (error: any) {
      this.logger.error(`Refresh token verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate token claims
   */
  async validateTokenClaims(payload: TokenPayload): Promise<void> {
    // Validate expiration (with clock tolerance)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp + this.clockTolerance) {
        throw new UnauthorizedException('Token expired');
      }
    }

    // Validate subject
    if (!payload.sub && !payload.userId) {
      throw new UnauthorizedException('Token missing subject claim');
    }

    // Validate issued at time
    if (payload.iat) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.iat > now + this.clockTolerance) {
        throw new UnauthorizedException('Token used before issued');
      }
    }
  }

  /**
   * Safely decode token without verification (for debugging/logging)
   */
  decodeTokenSafely(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token, { complete: false });
      return decoded as TokenPayload;
    } catch (error) {
      this.logger.error(`Failed to decode token: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeTokenSafely(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return true; // Assume expired if we can't get expiration
    }

    const now = new Date();
    const timeUntilExpiry = expiration.getTime() - now.getTime();
    return timeUntilExpiry < thresholdSeconds * 1000;
  }

  /**
   * Get token type from token
   */
  getTokenType(token: string): 'Bearer' | 'Refresh' | 'Unknown' {
    const decoded = this.decodeTokenSafely(token);
    if (!decoded) {
      return 'Unknown';
    }

    if (decoded.typ === 'Refresh') {
      return 'Refresh';
    }

    return 'Bearer';
  }
}
