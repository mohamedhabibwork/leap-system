import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { JwksClient } from 'jwks-rsa';
import { KeycloakAuthService } from './keycloak-auth.service';

export interface TokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
  azp?: string;
  scope?: string;
  typ?: string;
  session_state?: string;
  [key: string]: any;
}

export interface IntrospectionResult {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string | string[];
  iss?: string;
  [key: string]: any;
}

@Injectable()
export class TokenVerificationService {
  private readonly logger = new Logger(TokenVerificationService.name);
  private jwksClient: JwksClient | null = null;
  private readonly jwksUri: string;
  private readonly issuer: string;
  private readonly audience: string | undefined;
  private readonly strictIssuerCheck: boolean;
  private readonly introspectionFallback: boolean;
  private readonly clockTolerance: number;

  constructor(
    private configService: ConfigService,
    private keycloakAuthService: KeycloakAuthService,
  ) {
    // Get configuration
    const keycloakUrl = this.configService.get<string>('keycloak.authServerUrl') || 
                        this.configService.get<string>('KEYCLOAK_SERVER_URL') || 
                        this.configService.get<string>('KEYCLOAK_URL') || '';
    const realm = this.configService.get<string>('keycloak.realm') || 
                  this.configService.get<string>('KEYCLOAK_REALM') || '';
    
    this.issuer = this.configService.get<string>('keycloak.issuer') || 
                  this.configService.get<string>('KEYCLOAK_ISSUER') || 
                  `${keycloakUrl}/realms/${realm}`;
    
    this.jwksUri = this.configService.get<string>('keycloak.jwksUri') || 
                   this.configService.get<string>('KEYCLOAK_JWKS_URI') || 
                   `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;
    
    this.audience = this.configService.get<string>('TOKEN_VERIFY_AUDIENCE');
    this.strictIssuerCheck = this.configService.get<boolean>('TOKEN_VERIFY_ISSUER_STRICT') !== false;
    this.introspectionFallback = this.configService.get<boolean>('TOKEN_INTROSPECTION_FALLBACK') !== false;
    this.clockTolerance = this.configService.get<number>('TOKEN_CLOCK_TOLERANCE') || 30; // 30 seconds

    // Initialize JWKS client if configuration is available
    if (this.jwksUri && keycloakUrl && realm) {
      try {
        const cacheTTL = this.configService.get<number>('JWKS_CACHE_TTL') || 600000; // 10 minutes
        const rateLimit = this.configService.get<number>('JWKS_RATE_LIMIT') || 10;

        this.jwksClient = jwksClient({
          jwksUri: this.jwksUri,
          cache: true,
          cacheMaxAge: cacheTTL,
          rateLimit: true,
          jwksRequestsPerMinute: rateLimit,
        });

        this.logger.log(`JWKS client initialized with URI: ${this.jwksUri}`);
      } catch (error) {
        this.logger.error(`Failed to initialize JWKS client: ${error.message}`);
      }
    } else {
      this.logger.warn('Keycloak JWKS configuration is incomplete. Token verification will use fallback methods.');
    }
  }

  /**
   * Verify access token using JWKS with introspection fallback
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Try JWKS verification first
    if (this.jwksClient) {
      try {
        const payload = await this.verifyWithJWKS(token);
        await this.validateTokenClaims(payload);
        this.logger.debug('Token verified successfully using JWKS');
        return payload;
      } catch (error) {
        this.logger.warn(`JWKS verification failed: ${error.message}`);
        
        // If introspection fallback is disabled, throw the error
        if (!this.introspectionFallback) {
          throw error;
        }
        
        this.logger.debug('Attempting introspection fallback');
      }
    }

    // Fall back to introspection
    if (this.introspectionFallback) {
      try {
        const introspectionResult = await this.verifyWithIntrospection(token);
        
        if (!introspectionResult.active) {
          throw new UnauthorizedException('Token is not active');
        }

        // Decode token to get full payload (introspection gives limited info)
        const decoded = this.decodeTokenSafely(token);
        if (!decoded) {
          throw new UnauthorizedException('Failed to decode token');
        }

        this.logger.debug('Token verified successfully using introspection');
        return decoded;
      } catch (error) {
        this.logger.error(`Token introspection failed: ${error.message}`);
        throw new UnauthorizedException('Token verification failed');
      }
    }

    throw new UnauthorizedException('Token verification is not properly configured');
  }

  /**
   * Verify token using JWKS (JSON Web Key Set)
   */
  private async verifyWithJWKS(token: string): Promise<TokenPayload> {
    return new Promise((resolve, reject) => {
      // Get the signing key
      const getKey = (header: any, callback: any) => {
        if (!this.jwksClient) {
          return callback(new Error('JWKS client not initialized'));
        }

        this.jwksClient.getSigningKey(header.kid, (err, key) => {
          if (err) {
            this.logger.error(`Failed to get signing key: ${err.message}`);
            return callback(err);
          }

          const signingKey = key?.getPublicKey();
          callback(null, signingKey);
        });
      };

      // Verify token
      jwt.verify(
        token,
        getKey,
        {
          issuer: this.issuer,
          audience: this.audience,
          algorithms: ['RS256'],
          clockTolerance: this.clockTolerance,
        },
        (err, decoded) => {
          if (err) {
            this.logger.warn(`JWT verification failed: ${err.message}`);
            return reject(new UnauthorizedException('Invalid token'));
          }

          resolve(decoded as TokenPayload);
        }
      );
    });
  }

  /**
   * Verify token using Keycloak introspection endpoint
   */
  private async verifyWithIntrospection(token: string): Promise<IntrospectionResult> {
    try {
      const result = await this.keycloakAuthService.introspectToken(token);
      return result;
    } catch (error) {
      this.logger.error(`Token introspection error: ${error.message}`);
      throw new UnauthorizedException('Token introspection failed');
    }
  }

  /**
   * Verify refresh token (always uses introspection)
   */
  async verifyRefreshToken(refreshToken: string): Promise<boolean> {
    if (!refreshToken) {
      return false;
    }

    try {
      const result = await this.keycloakAuthService.introspectToken(refreshToken);
      return result.active === true;
    } catch (error) {
      this.logger.error(`Refresh token verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate token claims according to OIDC standards
   */
  async validateTokenClaims(payload: TokenPayload): Promise<void> {
    // Validate issuer
    if (this.strictIssuerCheck && payload.iss !== this.issuer) {
      throw new UnauthorizedException(`Invalid issuer: ${payload.iss}`);
    }

    // Validate audience if configured
    if (this.audience) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(this.audience)) {
        throw new UnauthorizedException('Invalid audience');
      }
    }

    // Validate expiration (with clock tolerance)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp + this.clockTolerance) {
        throw new UnauthorizedException('Token expired');
      }
    }

    // Validate subject
    if (!payload.sub) {
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
