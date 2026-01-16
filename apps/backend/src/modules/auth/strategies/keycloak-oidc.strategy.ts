import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OpenIDConnectStrategy, VerifyCallback } from 'passport-openidconnect';
import { ConfigService } from '@nestjs/config';
import { KeycloakSyncService } from '../keycloak-sync.service';
import { SessionService } from '../session.service';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class KeycloakOidcStrategy extends PassportStrategy(OpenIDConnectStrategy, 'keycloak-oidc') {
  private readonly logger = new Logger(KeycloakOidcStrategy.name);

  constructor(
    private configService: ConfigService,
    private keycloakSyncService: KeycloakSyncService,
    private sessionService: SessionService,
    private authService: AuthService,
  ) {
    const issuer = configService.get<string>('keycloak.issuer') ||
                   configService.get<string>('KEYCLOAK_ISSUER') ||
                   '';
    const oidcEnabled = configService.get<boolean>('keycloak.oidc.enabled') === true;
    
    // Only initialize if OIDC is enabled and issuer is configured
    if (!oidcEnabled || !issuer) {
      // Provide minimal config to satisfy PassportStrategy, but this strategy won't be used
      // The guard will check if Keycloak is configured before using this strategy
      const dummyIssuer = issuer || 'https://keycloak.habib.cloud/realms/leap-realm';
      super({
        issuer: dummyIssuer,
        authorizationURL: `${dummyIssuer}/protocol/openid-connect/auth`,
        tokenURL: `${dummyIssuer}/protocol/openid-connect/token`,
        userInfoURL: `${dummyIssuer}/protocol/openid-connect/userinfo`,
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:3000/api/v1/auth/keycloak/callback',
        scope: 'openid profile email',
        passReqToCallback: true,
      }, async () => {
        // No-op callback - this strategy won't be used if Keycloak is not configured
      });
      
      if (!issuer) {
        this.logger.warn('Keycloak OIDC Strategy initialized without issuer - OIDC flow will not work until Keycloak is configured');
      } else {
        this.logger.warn('Keycloak OIDC Strategy disabled - set keycloak.oidc.enabled=true to enable');
      }
      return;
    }

    const clientId = configService.get<string>('keycloak.clientId') ||
                     configService.get<string>('KEYCLOAK_CLIENT_ID') ||
                     'leap-client';
    const clientSecret = configService.get<string>('keycloak.clientSecret') ||
                        configService.get<string>('KEYCLOAK_CLIENT_SECRET') ||
                        '';
    const backendUrl = configService.get<string>('keycloak.urls.backend') ||
                      configService.get<string>('BACKEND_URL') ||
                      'http://localhost:3000';
    
    const callbackURL = `${backendUrl}/api/v1/auth/keycloak/callback`;

    super({
      issuer,
      authorizationURL: configService.get<string>('keycloak.authorizationEndpoint') || 'https://keycloak.habib.cloud/realms/leap-realm/protocol/openid-connect/auth',
      tokenURL: configService.get<string>('keycloak.tokenEndpoint') || 'https://keycloak.habib.cloud/realms/leap-realm/protocol/openid-connect/token',
      userInfoURL: configService.get<string>('keycloak.userinfoEndpoint') || 'https://keycloak.habib.cloud/realms/leap-realm/protocol/openid-connect/userinfo',
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL,
      scope: 'openid profile email',
      passReqToCallback: true,
    }, async (
      req: Request,
      issuer: string,
      sub: string,
      profile: any,
      accessToken: string,
      refreshToken: string,
      params: any,
      verified: VerifyCallback,
    ) => {
      try {
        await this.validateAndSyncUser(
          req,
          issuer,
          sub,
          profile,
          accessToken,
          refreshToken,
          params,
          verified,
        );
      } catch (error) {
        this.logger.error(`OIDC authentication error: ${error.message}`, error.stack);
        return verified(error, null);
      }
    });

    this.logger.log('Keycloak OIDC Strategy initialized');
  }

  /**
   * Validate and sync user after OIDC authentication
   */
  private async validateAndSyncUser(
    req: Request,
    issuer: string,
    sub: string,
    profile: any,
    accessToken: string,
    refreshToken: string,
    params: any,
    verified: VerifyCallback,
  ): Promise<void> {
    try {
      // Map Keycloak profile to our user format
      const keycloakUser = {
        sub: sub || profile.id,
        email: profile.emails?.[0]?.value || profile.email,
        email_verified: profile.email_verified || profile.emails?.[0]?.verified || false,
        preferred_username: profile.preferred_username || profile.username || profile.emails?.[0]?.value,
        given_name: profile.given_name || profile.name?.givenName || profile.firstName,
        family_name: profile.family_name || profile.name?.familyName || profile.lastName,
        name: profile.displayName || profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
      };

      // Find or create user in database (sync from Keycloak)
      let user = await this.authService.findOrCreateKeycloakUser(keycloakUser);

      if (!user) {
        this.logger.error('Failed to find or create user from Keycloak');
        return verified(new UnauthorizedException('User creation failed'), null);
      }

      // Sync user data from Keycloak (Keycloak is source of truth)
      const syncedUser = await this.keycloakSyncService.syncUserFromKeycloak(keycloakUser, keycloakUser.sub);
      
      // Use synced user if available, otherwise use the original user
      if (syncedUser) {
        user = syncedUser;
      }

      // Sync roles (only if sync is enabled, otherwise skip)
      try {
        await this.keycloakSyncService.syncUserRolesToKeycloak(user.id);
      } catch (error: any) {
        // Log but don't fail authentication if role sync fails
        this.logger.warn('Failed to sync user roles from Keycloak:', error?.message || error);
      }

      // Create session with tokens
      const sessionToken = await this.sessionService.createSession({
        userId: user.id,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: params.expires_in || 300, // Default 5 minutes
          refreshExpiresIn: params.refresh_expires_in,
          keycloakSessionId: params.session_state,
        },
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection?.remoteAddress,
          deviceInfo: (SessionService as any).parseUserAgent?.(req.headers['user-agent'] || ''),
        },
        rememberMe: false, // Could be passed via state parameter if needed
      });

      // Attach session token to request for cookie setting in controller
      req['sessionToken'] = sessionToken;

      // Map user to format expected by Passport
      const userForPassport = {
        id: user.id,
        userId: user.id,
        sub: user.id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        roleId: user.roleId,
        keycloakId: keycloakUser.sub,
        sessionToken,
        accessToken,
        refreshToken,
      };

      this.logger.log(`OIDC authentication successful for user: ${user.email}`);
      return verified(null, userForPassport);
    } catch (error: any) {
      this.logger.error(`Error in OIDC user validation: ${error.message}`, error.stack);
      return verified(error, null);
    }
  }
}
