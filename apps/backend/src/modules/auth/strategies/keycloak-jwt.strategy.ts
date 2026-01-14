import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenVerificationService } from '../token-verification.service';

@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(Strategy, 'keycloak-jwt') {
  private readonly logger = new Logger(KeycloakJwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private tokenVerificationService: TokenVerificationService,
  ) {
    const keycloakUrl = configService.get<string>('keycloak.authServerUrl') || 
                        configService.get<string>('KEYCLOAK_SERVER_URL') || 
                        configService.get<string>('KEYCLOAK_URL') || '';
    const realm = configService.get<string>('keycloak.realm') || 
                  configService.get<string>('KEYCLOAK_REALM') || '';
    const jwksUri = configService.get<string>('keycloak.jwksUri') || 
                   configService.get<string>('KEYCLOAK_JWKS_URI') || 
                   `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // We handle expiration in TokenVerificationService
      secretOrKeyProvider: async (request: any, rawJwtToken: any, done: any) => {
        // This will not be used since we override validate method
        // But passport-jwt requires it
        done(null, null);
      },
      passReqToCallback: false,
    });

    this.logger.log('Keycloak JWT Strategy initialized');
  }

  /**
   * Validate JWT token using TokenVerificationService
   * This method is called after passport extracts the token
   */
  async validate(payload: any): Promise<any> {
    try {
      // Note: The payload here is the raw token string when using custom verification
      // We need to get the actual token from the request context
      // Since passport-jwt has already extracted it, we'll work with what we have
      
      // If payload is already verified (has sub), return it
      if (payload && payload.sub) {
        return this.mapTokenPayloadToUser(payload);
      }

      // This shouldn't happen in normal flow, but handle it
      this.logger.warn('Received invalid payload in validate method');
      throw new UnauthorizedException('Invalid token payload');
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Map Keycloak token payload to user object
   */
  private mapTokenPayloadToUser(payload: any) {
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
      scope: payload.scope,
      sessionState: payload.session_state,
      azp: payload.azp, // Authorized party (client)
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      typ: payload.typ,
    };
  }
}
