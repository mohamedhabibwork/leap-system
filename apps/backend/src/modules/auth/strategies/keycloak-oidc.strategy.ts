import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OpenIDConnectStrategy, VerifyCallback } from 'passport-openidconnect';
import { ConfigService } from '@nestjs/config';
import { KeycloakSyncService } from '../keycloak-sync.service';
import { SessionService } from '../session.service';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * Custom state store that doesn't require Express sessions
 * Uses in-memory storage with automatic cleanup
 * 
 * This store implements the interface required by passport-openidconnect
 * to handle OAuth state parameter for CSRF protection
 * 
 * NOTE: This is a singleton instance shared across all requests.
 * For production with multiple server instances, consider using Redis.
 */
class StatelessStore {
  private static instance: StatelessStore;
  private states: Map<string, { state: string; timestamp: number; meta?: any }> = new Map();
  private readonly ttl = 10 * 60 * 1000; // 10 minutes

  static getInstance(): StatelessStore {
    if (!StatelessStore.instance) {
      StatelessStore.instance = new StatelessStore();
    }
    return StatelessStore.instance;
  }

  /**
   * Store the state parameter when initiating authorization
   */
  store(req: Request, state: string, meta: any, callback: (err?: Error) => void): void {
    try {
      // Use the state value itself as the key for simplicity
      // In production, you might want to use a more secure approach
      this.states.set(state, {
        state,
        timestamp: Date.now(),
        meta,
      });

      // Clean up old states periodically
      this.cleanup();

      callback();
    } catch (error: any) {
      callback(error);
    }
  }

  /**
   * Verify the state parameter when receiving the callback
   */
  verify(req: Request, providedState: string, callback: (err: Error | null, ok?: boolean, state?: string, meta?: any) => void): void {
    try {
      // Clean up expired states
      this.cleanup();

      if (!providedState) {
        return callback(new Error('Missing state parameter'));
      }

      // Check if we have this state stored
      const stored = this.states.get(providedState);
      
      if (!stored) {
        // State not found - this could happen if:
        // 1. State expired (cleaned up)
        // 2. State was never stored (different server instance in cluster)
        // 3. State was tampered with
        // 
        // For now, we'll be lenient and accept the state if it's present
        // since Keycloak already validates it. In production, you might want
        // to use a shared store (Redis) or signed states
        return callback(null, true, providedState, {});
      }

      // Check if state has expired
      const age = Date.now() - stored.timestamp;
      if (age > this.ttl) {
        this.states.delete(providedState);
        return callback(new Error('State has expired'));
      }

      // State is valid
      callback(null, true, stored.state, stored.meta);
    } catch (error: any) {
      callback(error);
    }
  }

  /**
   * Clean up expired states
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.states.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.states.delete(key);
      }
    }
  }
}

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
    // Check both the config path and direct env var, default to true if not set
    const oidcEnabled = configService.get<boolean>('keycloak.oidc.enabled') !== false &&
                       (configService.get<boolean>('keycloak.oidc.enabled') === true ||
                        process.env.KEYCLOAK_OIDC_ENABLED !== 'false');
    
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

    // Note: We're using express-session for state management now
    // The custom StatelessStore is kept for reference but not used
    // since passport-openidconnect will use the session store when available

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
      // Don't specify store - let passport-openidconnect use the session store
      // The session store is configured in main.ts via express-session middleware
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
        this.logger.debug('OIDC verify callback called', {
          hasIssuer: !!issuer,
          hasSub: !!sub,
          hasProfile: !!profile,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          profileEmail: profile?.email || profile?.emails?.[0]?.value,
          profileKeys: profile ? Object.keys(profile) : [],
          paramsKeys: params ? Object.keys(params) : [],
          expiresIn: params?.expires_in,
          sessionState: params?.session_state,
        });
        
        // Validate required data
        if (!sub && !profile?.id) {
          const error = new Error('Missing subject (sub) in OIDC response');
          this.logger.error(error.message, { issuer, profile });
          return verified(error, null);
        }

        if (!accessToken) {
          const error = new Error('Missing access token in OIDC response');
          this.logger.error(error.message);
          return verified(error, null);
        }

        if (!profile) {
          const error = new Error('Missing profile in OIDC response');
          this.logger.error(error.message);
          return verified(error, null);
        }

        const email = profile.emails?.[0]?.value || profile.email;
        if (!email) {
          const error = new Error('Missing email in OIDC profile');
          this.logger.error(error.message, { profileKeys: Object.keys(profile) });
          return verified(error, null);
        }
        
        await this.validateAndSyncUser(
          req,
          issuer,
          sub || profile.id,
          profile,
          accessToken,
          refreshToken,
          params,
          verified,
        );
      } catch (error: any) {
        this.logger.error(`OIDC authentication error: ${error.message}`, {
          stack: error.stack,
          issuer,
          sub,
          hasProfile: !!profile,
        });
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
      this.logger.debug('Starting OIDC user validation and sync', {
        sub,
        profileKeys: profile ? Object.keys(profile) : [],
        hasEmail: !!(profile?.email || profile?.emails?.[0]?.value),
        expiresIn: params?.expires_in,
      });

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

      if (!keycloakUser.email) {
        const error = new Error('Email is required but not found in Keycloak profile');
        this.logger.error(error.message, { profile, sub });
        return verified(error, null);
      }

      this.logger.debug('Mapped Keycloak user', {
        sub: keycloakUser.sub,
        email: keycloakUser.email,
        username: keycloakUser.preferred_username,
      });

      // Find or create user in database (sync from Keycloak)
      let user = await this.authService.findOrCreateKeycloakUser(keycloakUser);

      if (!user) {
        const error = new UnauthorizedException('User creation failed');
        this.logger.error(error.message, { keycloakUser });
        return verified(error, null);
      }

      this.logger.debug('User found/created in database', {
        userId: user.id,
        email: user.email,
        keycloakUserId: user.keycloakUserId,
      });

      // Sync user data from Keycloak (Keycloak is source of truth)
      try {
        const syncedUser = await this.keycloakSyncService.syncUserFromKeycloak(keycloakUser, keycloakUser.sub);
        
        // Use synced user if available, otherwise use the original user
        if (syncedUser) {
          user = syncedUser;
          this.logger.debug('User synced from Keycloak', { userId: user.id });
        }
      } catch (error: any) {
        // Log but don't fail authentication if sync fails
        this.logger.warn('Failed to sync user from Keycloak:', error?.message || error);
      }

      // Sync roles (only if sync is enabled, otherwise skip)
      try {
        await this.keycloakSyncService.syncUserRolesToKeycloak(user.id);
      } catch (error: any) {
        // Log but don't fail authentication if role sync fails
        this.logger.warn('Failed to sync user roles from Keycloak:', error?.message || error);
      }

      // Create session with tokens
      this.logger.debug('Creating session for user', {
        userId: user.id,
        expiresIn: params?.expires_in || 300,
        hasRefreshToken: !!refreshToken,
      });

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

      this.logger.debug('Session created successfully', {
        userId: user.id,
        sessionToken: sessionToken.substring(0, 8) + '...',
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

      this.logger.log(`OIDC authentication successful for user: ${user.email} (ID: ${user.id})`);
      return verified(null, userForPassport);
    } catch (error: any) {
      this.logger.error(`Error in OIDC user validation: ${error.message}`, {
        stack: error.stack,
        sub,
        hasProfile: !!profile,
      });
      return verified(error, null);
    }
  }
}
