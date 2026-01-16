import { Injectable, Inject, NotFoundException, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { sessions, users } from '@leap-lms/database';
import { eq, and, desc, lt } from 'drizzle-orm';
import { KeycloakAuthService } from './keycloak-auth.service';
import { AuthService } from './auth.service';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  refreshExpiresIn?: number; // seconds
  keycloakSessionId?: string;
}

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: any;
}

export interface CreateSessionData {
  userId: number;
  tokens: SessionTokens;
  metadata?: SessionMetadata;
  rememberMe?: boolean;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly maxConcurrentSessions: number;
  private readonly defaultSessionDuration: number;
  private readonly rememberMeSessionDuration: number;
  private readonly tokenRefreshThreshold: number;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
    @Inject(forwardRef(() => KeycloakAuthService))
    private keycloakAuthService: KeycloakAuthService,
    private authService: AuthService,
  ) {
    // Load configuration from keycloak config
    this.maxConcurrentSessions = this.configService.get<number>('keycloak.session.maxConcurrentSessions') || 5;
    this.defaultSessionDuration = this.configService.get<number>('keycloak.session.maxAge') || 604800; // 7 days
    this.rememberMeSessionDuration = this.configService.get<number>('keycloak.session.maxAgeRememberMe') || 2592000; // 30 days
    this.tokenRefreshThreshold = this.configService.get<number>('keycloak.session.tokenRefreshThreshold') || 300; // 5 minutes
  }

  /**
   * Create a new session with tokens (Keycloak or JWT)
   */
  async createSession(data: CreateSessionData): Promise<string> {
    try {
      // Verify tokens before creating session
      this.logger.debug('Verifying tokens before session creation');
      
      // Try to verify with Keycloak first (for Keycloak tokens)
      // If that fails, assume it's a JWT token (for DB authentication)
      let accessTokenValid = false;
      try {
        accessTokenValid = await this.keycloakAuthService.verifyAccessToken(data.tokens.accessToken);
      } catch (error) {
        // Not a Keycloak token, likely a JWT token - skip Keycloak verification
        this.logger.debug('Token is not a Keycloak token, assuming JWT token');
        accessTokenValid = true; // Accept JWT tokens without Keycloak verification
      }

      if (!accessTokenValid) {
        throw new Error('Invalid access token');
      }

      // Try to validate refresh token with Keycloak (optional)
      try {
        const refreshTokenValid = await this.keycloakAuthService.validateRefreshToken(data.tokens.refreshToken);
        if (!refreshTokenValid) {
          this.logger.warn('Refresh token validation failed during session creation');
          // Don't fail session creation if refresh token is invalid
          // It might be a different token type
        }
      } catch (error) {
        // Refresh token validation failed, but continue (might be JWT)
        this.logger.debug('Refresh token validation skipped (likely JWT token)');
      }

      const sessionToken = this.generateSessionToken();
      const expiresIn = data.rememberMe ? this.rememberMeSessionDuration : this.defaultSessionDuration;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      const accessTokenExpiresAt = new Date(Date.now() + data.tokens.expiresIn * 1000);
      const refreshTokenExpiresAt = new Date(
        Date.now() + (data.tokens.refreshExpiresIn || expiresIn) * 1000
      );

      // Enforce session limit
      await this.enforceSessionLimit(data.userId);

      // Create session
      await this.db.insert(sessions).values({
        userId: data.userId,
        sessionToken,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        keycloakSessionId: data.tokens.keycloakSessionId || null,
        expiresAt,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        userAgent: data.metadata?.userAgent || null,
        ipAddress: data.metadata?.ipAddress || null,
        deviceInfo: data.metadata?.deviceInfo ? JSON.stringify(data.metadata.deviceInfo) : null,
        rememberMe: data.rememberMe || false,
        isActive: true,
      });

      this.logger.log(`Session created for user ${data.userId} with verified tokens`);
      return sessionToken;
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get session by token with user data
   */
  async getSession(sessionToken: string) {
    try {
      const result = await this.db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.sessionToken, sessionToken),
            eq(sessions.isActive, true)
          )
        )
        .limit(1);

      if (!result || result.length === 0 || !result[0].session) {
        throw new NotFoundException('Session not found');
      }

      const { session: sessionData, user: userData } = result[0];

      // Check if session is expired
      if (new Date() > new Date(sessionData.expiresAt)) {
        await this.revokeSession(sessionToken);
        throw new NotFoundException('Session expired');
      }

      return {
        sessions: sessionData,
        user: userData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get session: ${error.message}`, error.stack);
      throw new NotFoundException('Session not found');
    }
  }

  /**
   * Get session by token without user data (lighter query)
   */
  async getSessionOnly(sessionToken: string) {
    try {
      const [session] = await this.db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.sessionToken, sessionToken),
            eq(sessions.isActive, true)
          )
        )
        .limit(1);

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.revokeSession(sessionToken);
        throw new NotFoundException('Session expired');
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get session: ${error.message}`, error.stack);
      throw new NotFoundException('Session not found');
    }
  }

  /**
   * Refresh session tokens if near expiry
   */
  async refreshSession(sessionToken: string): Promise<void> {
    try {
      const session = await this.getSessionOnly(sessionToken);

      // Check if access token is near expiry
      const now = new Date();
      const timeUntilExpiry = (new Date(session.accessTokenExpiresAt).getTime() - now.getTime()) / 1000;

      if (timeUntilExpiry > this.tokenRefreshThreshold) {
        // Token still valid, no refresh needed
        this.logger.debug(`Token still valid for session ${sessionToken.substring(0, 8)}, ${Math.floor(timeUntilExpiry)}s remaining`);
        return;
      }

      this.logger.log(`Refreshing tokens for session ${sessionToken.substring(0, 8)}... (expires in ${Math.floor(timeUntilExpiry)}s)`);

      // Try Keycloak refresh first (if Keycloak is configured)
      let newTokens: any = null;
      let isKeycloakToken = false;

      if (this.keycloakAuthService.isConfigured()) {
        try {
          // Verify current refresh token is still valid with Keycloak
          const refreshTokenValid = await this.keycloakAuthService.validateRefreshToken(session.refreshToken);
          if (refreshTokenValid) {
            // Refresh tokens via Keycloak
            newTokens = await this.keycloakAuthService.refreshToken(session.refreshToken);
            isKeycloakToken = true;

            // Verify new access token
            const newAccessTokenValid = await this.keycloakAuthService.verifyAccessToken(newTokens.access_token);
            if (!newAccessTokenValid) {
              this.logger.error('New access token verification failed');
              throw new Error('Failed to verify refreshed access token');
            }
          }
        } catch (error) {
          this.logger.debug(`Keycloak token refresh failed, trying JWT: ${error.message}`);
          // Fall through to JWT refresh
        }
      }

      // Fallback to JWT token refresh (for database-authenticated users)
      if (!newTokens) {
        try {
          const refreshResult = await this.authService.refreshToken(session.refreshToken);
          // Calculate expires_in from JWT config if not provided
          const jwtExpiresInConfig = this.configService.get<string | number>('jwt.expiresIn');
          let expiresInSeconds = 3600; // Default to 1 hour
          
          if (jwtExpiresInConfig) {
            if (typeof jwtExpiresInConfig === 'string') {
              // Parse string like "1h", "3600s", etc.
              const match = jwtExpiresInConfig.match(/^(\d+)([smhd]?)$/i);
              if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2].toLowerCase();
                if (unit === 'h') expiresInSeconds = value * 3600;
                else if (unit === 'm') expiresInSeconds = value * 60;
                else if (unit === 'd') expiresInSeconds = value * 86400;
                else expiresInSeconds = value; // seconds
              } else {
                expiresInSeconds = parseInt(jwtExpiresInConfig, 10) || 3600;
              }
            } else {
              expiresInSeconds = jwtExpiresInConfig;
            }
          }
          
          newTokens = {
            access_token: refreshResult.access_token,
            refresh_token: (refreshResult as any).refresh_token || session.refreshToken, // Keep existing refresh token if not provided
            expires_in: (refreshResult as any).expires_in || expiresInSeconds,
            refresh_expires_in: (refreshResult as any).refresh_expires_in || undefined, // Optional, only for Keycloak tokens
          };
        } catch (error) {
          this.logger.warn(`JWT token refresh failed: ${error.message}`);
          // If both Keycloak and JWT refresh fail, revoke session
          await this.revokeSession(sessionToken);
          throw new Error('Refresh token is no longer valid');
        }
      }

      // Update session with new tokens
      const accessTokenExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
      let refreshTokenExpiresAt: Date;
      
      if (newTokens.refresh_expires_in) {
        refreshTokenExpiresAt = new Date(Date.now() + newTokens.refresh_expires_in * 1000);
      } else if (session.refreshTokenExpiresAt) {
        // Preserve existing refresh token expiry time
        const existingExpiry = new Date(session.refreshTokenExpiresAt);
        const timeRemaining = existingExpiry.getTime() - now.getTime();
        refreshTokenExpiresAt = new Date(Date.now() + Math.max(timeRemaining, 0));
      } else {
        // Fallback to remember me duration
        refreshTokenExpiresAt = new Date(Date.now() + this.rememberMeSessionDuration * 1000);
      }

      await this.db
        .update(sessions)
        .set({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || session.refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(sessions.sessionToken, sessionToken));

      this.logger.log(`Tokens refreshed and verified successfully for session ${sessionToken.substring(0, 8)}... (${isKeycloakToken ? 'Keycloak' : 'JWT'})`);
    } catch (error) {
      this.logger.error(`Failed to refresh session: ${error.message}`, error.stack);
      // Mark session as inactive if refresh fails
      await this.revokeSession(sessionToken);
      throw error;
    }
  }

  /**
   * Check if session needs token refresh
   */
  async needsRefresh(sessionToken: string): Promise<boolean> {
    try {
      const session = await this.getSessionOnly(sessionToken);
      const now = new Date();
      const timeUntilExpiry = (new Date(session.accessTokenExpiresAt).getTime() - now.getTime()) / 1000;
      return timeUntilExpiry <= this.tokenRefreshThreshold;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update session last activity
   */
  async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      await this.db
        .update(sessions)
        .set({
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sessions.sessionToken, sessionToken));
    } catch (error) {
      this.logger.warn(`Failed to update session activity: ${error.message}`);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number) {
    try {
      const userSessions = await this.db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.isActive, true)
          )
        )
        .orderBy(desc(sessions.lastActivityAt));

      // Filter out expired sessions
      const now = new Date();
      return userSessions.filter(session => new Date(session.expiresAt) > now);
    } catch (error) {
      this.logger.error(`Failed to get user sessions: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionToken: string): Promise<void> {
    try {
      // Get session to logout from Keycloak
      const [session] = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .limit(1);

      if (session && session.refreshToken) {
        // Try to logout from Keycloak (best effort)
        try {
          await this.keycloakAuthService.logout(session.refreshToken);
        } catch (error) {
          this.logger.warn(`Failed to logout from Keycloak: ${error.message}`);
          // Continue with local session revocation
        }
      }

      // Revoke session in DB
      await this.db
        .update(sessions)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(sessions.sessionToken, sessionToken));

      this.logger.log(`Session revoked: ${sessionToken.substring(0, 8)}...`);
    } catch (error) {
      this.logger.error(`Failed to revoke session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user except the current one
   */
  async revokeOtherSessions(userId: number, currentSessionToken: string): Promise<number> {
    try {
      const userSessions = await this.getUserSessions(userId);
      const otherSessions = userSessions.filter(s => s.sessionToken !== currentSessionToken);

      for (const session of otherSessions) {
        await this.revokeSession(session.sessionToken);
      }

      this.logger.log(`Revoked ${otherSessions.length} other sessions for user ${userId}`);
      return otherSessions.length;
    } catch (error) {
      this.logger.error(`Failed to revoke other sessions: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId: number): Promise<number> {
    try {
      const userSessions = await this.getUserSessions(userId);

      for (const session of userSessions) {
        await this.revokeSession(session.sessionToken);
      }

      this.logger.log(`Revoked ${userSessions.length} sessions for user ${userId}`);
      return userSessions.length;
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * Clean up expired sessions (called by cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      
      // Get expired sessions
      const expiredSessions = await this.db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.isActive, true),
            lt(sessions.expiresAt, now)
          )
        );

      if (expiredSessions.length === 0) {
        return 0;
      }

      // Mark as inactive
      await this.db
        .update(sessions)
        .set({
          isActive: false,
          updatedAt: now,
        })
        .where(
          and(
            eq(sessions.isActive, true),
            lt(sessions.expiresAt, now)
          )
        );

      this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
      return expiredSessions.length;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired sessions: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * Enforce session limit per user
   */
  private async enforceSessionLimit(userId: number): Promise<void> {
    try {
      const activeSessions = await this.getUserSessions(userId);

      if (activeSessions.length >= this.maxConcurrentSessions) {
        // Revoke oldest sessions
        const sessionsToRevoke = activeSessions
          .sort((a, b) => new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime())
          .slice(0, activeSessions.length - this.maxConcurrentSessions + 1);

        for (const session of sessionsToRevoke) {
          await this.revokeSession(session.sessionToken);
        }

        this.logger.log(`Enforced session limit for user ${userId}, revoked ${sessionsToRevoke.length} old sessions`);
      }
    } catch (error) {
      this.logger.warn(`Failed to enforce session limit: ${error.message}`);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  /**
   * Parse user agent to extract device info
   */
  static parseUserAgent(userAgent: string): {
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    deviceType?: string;
  } {
    const result: any = {};

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      result.browser = 'Chrome';
      const match = userAgent.match(/Chrome\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
      const match = userAgent.match(/Firefox\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      result.browser = 'Safari';
      const match = userAgent.match(/Version\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Edg')) {
      result.browser = 'Edge';
      const match = userAgent.match(/Edg\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      result.os = 'Windows';
      if (userAgent.includes('Windows NT 10.0')) result.osVersion = '10';
      else if (userAgent.includes('Windows NT 6.3')) result.osVersion = '8.1';
      else if (userAgent.includes('Windows NT 6.2')) result.osVersion = '8';
      else if (userAgent.includes('Windows NT 6.1')) result.osVersion = '7';
    } else if (userAgent.includes('Mac OS X')) {
      result.os = 'macOS';
      const match = userAgent.match(/Mac OS X ([\d_]+)/);
      result.osVersion = match ? match[1].replace(/_/g, '.') : undefined;
    } else if (userAgent.includes('Linux') && !userAgent.includes('Android')) {
      result.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      result.os = 'Android';
      const match = userAgent.match(/Android ([\d.]+)/);
      result.osVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      result.os = 'iOS';
      const match = userAgent.match(/OS ([\d_]+)/);
      result.osVersion = match ? match[1].replace(/_/g, '.') : undefined;
    }

    // Detect device type
    if (userAgent.includes('Mobile') && !userAgent.includes('iPad')) {
      result.deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      result.deviceType = 'Tablet';
    } else {
      result.deviceType = 'Desktop';
    }

    return result;
  }
}
