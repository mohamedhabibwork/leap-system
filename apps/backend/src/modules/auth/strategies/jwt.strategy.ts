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
  private readonly useKeycloakVerification: boolean;

  constructor(
    private configService: ConfigService,
    private tokenVerificationService: TokenVerificationService,
  ) {
    // Check if Keycloak verification should be used
    // Only enable if Keycloak is fully configured (URL, realm, client ID, and secret)
    const keycloakUrl = configService.get<string>('keycloak.authServerUrl') || 
                        configService.get<string>('KEYCLOAK_SERVER_URL') || '';
    const realm = configService.get<string>('keycloak.realm') || 
                  configService.get<string>('KEYCLOAK_REALM') || '';
    const clientId = configService.get<string>('keycloak.clientId') || 
                     configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    const clientSecret = configService.get<string>('keycloak.clientSecret') || 
                        configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';
    
    const keycloakConfigured = !!(keycloakUrl && realm && clientId && clientSecret);
    const useKeycloak = configService.get<boolean>('USE_KEYCLOAK_TOKEN_VERIFICATION') !== false;
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // We'll handle expiration in our verification
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true, // Get request to extract token
    });

    this.useKeycloakVerification = keycloakConfigured && useKeycloak;
    
    if (this.useKeycloakVerification) {
      this.logger.log('JWT Strategy initialized with Keycloak token verification');
    } else {
      this.logger.log('JWT Strategy initialized with local token verification');
    }
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

      // If Keycloak verification is enabled, verify with Keycloak
      if (this.useKeycloakVerification) {
        try {
          const verifiedPayload = await this.tokenVerificationService.verifyAccessToken(token);
          
          // Map Keycloak payload to our user format
          const user = this.mapKeycloakPayload(verifiedPayload);
          this.logger.debug(`Token validated successfully for user: ${user.id}`);
          return user;
        } catch (error) {
          this.logger.warn(`Keycloak token verification failed: ${error.message}, falling back to local verification`);
          
          // Fall back to local token verification for migration support
          // Only if payload exists (token was decoded successfully)
          if (payload && payload.sub) {
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
      }

      // Use local token verification
      if (!payload || !payload.sub) {
        this.logger.error('Token payload is missing or invalid');
        throw new UnauthorizedException('Invalid token payload');
      }

      return this.validateLocalToken(payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Token validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException(`Token validation failed: ${error.message}`);
    }
  }

  /**
   * Map Keycloak token payload to our user object
   * Handles both OIDC tokens (from Passport OIDC strategy) and direct Keycloak tokens
   */
  private mapKeycloakPayload(payload: any) {
    // Extract realm roles
    const realmRoles = payload.realm_access?.roles || [];
    
    // Extract resource/client roles
    const resourceRoles: string[] = [];
    if (payload.resource_access) {
      Object.values(payload.resource_access).forEach((resource: any) => {
        if (resource.roles) {
          resourceRoles.push(...resource.roles);
        }
      });
    }

    // Combine all roles
    const allRoles = [...new Set([...realmRoles, ...resourceRoles])];

    return {
      sub: payload.sub,
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      username: payload.preferred_username || payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
      roles: allRoles,
      realmRoles,
      resourceRoles,
      roleId: payload.roleId, // For backward compatibility
      permissions: payload.permissions, // For backward compatibility
      keycloakId: payload.sub,
      scope: payload.scope,
      sessionState: payload.session_state,
    };
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
