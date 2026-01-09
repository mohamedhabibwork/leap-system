import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, desc } from 'drizzle-orm';
import { pgTable, bigserial, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';

// Session schema
export const userSessions = pgTable('user_sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigserial('user_id', { mode: 'number' }).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  deviceFingerprint: varchar('device_fingerprint', { length: 255 }),
  deviceName: varchar('device_name', { length: 255 }),
  deviceType: varchar('device_type', { length: 50 }),
  browser: varchar('browser', { length: 100 }),
  browserVersion: varchar('browser_version', { length: 50 }),
  os: varchar('os', { length: 100 }),
  osVersion: varchar('os_version', { length: 50 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  location: varchar('location', { length: 255 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export interface SessionData {
  userId: number;
  sessionToken?: string;
  refreshToken?: string;
  deviceInfo: {
    fingerprint: string;
    name?: string;
    type?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
  };
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  expiresIn?: number; // in seconds
}

@Injectable()
export class SessionService {
  private readonly maxConcurrentSessions: number;
  private readonly defaultSessionDuration: number;
  private readonly rememberMeSessionDuration: number;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {
    this.maxConcurrentSessions = parseInt(
      this.configService.get<string>('MAX_CONCURRENT_SESSIONS') || '5',
      10
    );
    this.defaultSessionDuration = parseInt(
      this.configService.get<string>('SESSION_MAX_AGE') || '604800',
      10
    ); // 7 days
    this.rememberMeSessionDuration = parseInt(
      this.configService.get<string>('SESSION_MAX_AGE_REMEMBER_ME') || '2592000',
      10
    ); // 30 days
  }

  /**
   * Create a new session
   */
  async createSession(sessionData: SessionData, rememberMe: boolean = false): Promise<string> {
    const sessionToken = sessionData.sessionToken || this.generateSessionToken();
    const expiresIn = rememberMe ? this.rememberMeSessionDuration : this.defaultSessionDuration;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Check if user has too many active sessions
    await this.enforceSessionLimit(sessionData.userId);

    // Create session
    await this.db.insert(userSessions).values({
      userId: sessionData.userId,
      sessionToken,
      refreshToken: sessionData.refreshToken,
      deviceFingerprint: sessionData.deviceInfo.fingerprint,
      deviceName: sessionData.deviceInfo.name,
      deviceType: sessionData.deviceInfo.type,
      browser: sessionData.deviceInfo.browser,
      browserVersion: sessionData.deviceInfo.browserVersion,
      os: sessionData.deviceInfo.os,
      osVersion: sessionData.deviceInfo.osVersion,
      ipAddress: sessionData.ipAddress,
      location: sessionData.location,
      userAgent: sessionData.userAgent,
      expiresAt,
    });

    return sessionToken;
  }

  /**
   * Get session by token
   */
  async getSession(sessionToken: string) {
    const [session] = await this.db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          eq(userSessions.isActive, true)
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
  }

  /**
   * Update session last activity
   */
  async updateSessionActivity(sessionToken: string): Promise<void> {
    await this.db
      .update(userSessions)
      .set({
        lastActivityAt: new Date(),
      })
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number) {
    const sessions = await this.db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isActive, true)
        )
      )
      .orderBy(desc(userSessions.lastActivityAt));

    // Filter out expired sessions
    const now = new Date();
    return sessions.filter(session => new Date(session.expiresAt) > now);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionToken: string): Promise<void> {
    await this.db
      .update(userSessions)
      .set({
        isActive: false,
      })
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  /**
   * Revoke all sessions for a user except the current one
   */
  async revokeOtherSessions(userId: number, currentSessionToken: string): Promise<number> {
    const result = await this.db
      .update(userSessions)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isActive, true)
        )
      )
      .returning();

    // Reactivate current session
    await this.db
      .update(userSessions)
      .set({
        isActive: true,
      })
      .where(eq(userSessions.sessionToken, currentSessionToken));

    return result.length - 1; // Subtract 1 for the current session
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId: number): Promise<number> {
    const result = await this.db
      .update(userSessions)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isActive, true)
        )
      )
      .returning();

    return result.length;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.db
      .update(userSessions)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(userSessions.isActive, true)
        )
      )
      .returning();

    const now = new Date();
    const expired = result.filter(session => new Date(session.expiresAt) <= now);
    
    return expired.length;
  }

  /**
   * Enforce session limit per user
   */
  private async enforceSessionLimit(userId: number): Promise<void> {
    const activeSessions = await this.getUserSessions(userId);

    if (activeSessions.length >= this.maxConcurrentSessions) {
      // Revoke oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.revokeSession(oldestSession.sessionToken);
    }
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const data = `${userAgent}-${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
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
    // Simple user agent parsing (consider using a library like ua-parser-js for production)
    const result: any = {};

    // Detect browser
    if (userAgent.includes('Chrome')) {
      result.browser = 'Chrome';
      const match = userAgent.match(/Chrome\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
      const match = userAgent.match(/Firefox\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Safari')) {
      result.browser = 'Safari';
      const match = userAgent.match(/Version\/([\d.]+)/);
      result.browserVersion = match ? match[1] : undefined;
    } else if (userAgent.includes('Edge')) {
      result.browser = 'Edge';
      const match = userAgent.match(/Edge\/([\d.]+)/);
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
    } else if (userAgent.includes('Linux')) {
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
    if (userAgent.includes('Mobile')) {
      result.deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      result.deviceType = 'Tablet';
    } else {
      result.deviceType = 'Desktop';
    }

    return result;
  }
}
