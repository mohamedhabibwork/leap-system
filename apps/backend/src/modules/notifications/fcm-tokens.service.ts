import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import { fcmTokens, FCMToken, NewFCMToken } from '@leap-lms/database';
import * as schema from '@leap-lms/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

@Injectable()
export class FCMTokensService {
  private readonly logger = new Logger(FCMTokensService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Register or update FCM token for a user
   */
  async registerToken(
    userId: number,
    token: string,
    deviceType?: string,
    deviceInfo?: Record<string, unknown>
  ): Promise<FCMToken> {
    try {
      // Validate required parameters
      if (!userId || userId === undefined || userId === null) {
        throw new Error('User ID is required');
      }
      if (!token || !token.trim()) {
        throw new Error('FCM token is required');
      }

      // Check if token already exists
      const [existingToken] = await this.db
        .select()
        .from(fcmTokens)
        .where(eq(fcmTokens.token, token))
        .limit(1);

      if (existingToken) {
        // Update existing token
        const [updated] = await this.db
          .update(fcmTokens)
          .set({
            userId,
            deviceType,
            deviceInfo,
            isActive: true,
            lastUsedAt: new Date(),
          } as Partial<InferInsertModel<typeof fcmTokens>>)
          .where(eq(fcmTokens.token, token))
          .returning();

        this.logger.log(`Updated FCM token for user ${userId}`);
        return updated;
      } else {
        // Insert new token
        const [newToken] = await this.db
          .insert(fcmTokens)
          .values({
            userId,
            token,
            deviceType,
            deviceInfo,
            isActive: true,
          } as NewFCMToken)
          .returning();

        this.logger.log(`Registered new FCM token for user ${userId}`);
        return newToken;
      }
    } catch (error) {
      this.logger.error(`Failed to register FCM token:`, error);
      throw error;
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(token: string): Promise<void> {
    try {
      await this.db
        .update(fcmTokens)
        .set({ isActive: false } as Partial<InferInsertModel<typeof fcmTokens>>)
        .where(eq(fcmTokens.token, token));

      this.logger.log(`Unregistered FCM token`);
    } catch (error) {
      this.logger.error(`Failed to unregister FCM token:`, error);
      throw error;
    }
  }

  /**
   * Delete FCM token permanently
   */
  async deleteToken(token: string): Promise<void> {
    try {
      await this.db.delete(fcmTokens).where(eq(fcmTokens.token, token));
      this.logger.log(`Deleted FCM token`);
    } catch (error) {
      this.logger.error(`Failed to delete FCM token:`, error);
      throw error;
    }
  }

  /**
   * Get all active tokens for a user
   */
  async getUserTokens(userId: number): Promise<FCMToken[]> {
    try {
      const tokens = await this.db
        .select()
        .from(fcmTokens)
        .where(and(eq(fcmTokens.userId, userId), eq(fcmTokens.isActive, true)));

      return tokens;
    } catch (error) {
      this.logger.error(`Failed to get user tokens:`, error);
      return [];
    }
  }

  /**
   * Get all active token strings for a user (for sending notifications)
   */
  async getUserTokenStrings(userId: number): Promise<string[]> {
    const tokens = await this.getUserTokens(userId);
    return tokens.map(t => t.token);
  }

  /**
   * Get user's registered devices
   */
  async getUserDevices(userId: number): Promise<Array<{
    id: number;
    deviceType: string | null;
    deviceInfo: Record<string, unknown> | null;
    isActive: boolean;
    createdAt: Date;
    lastUsedAt: Date | null;
  }>> {
    try {
      const tokens = await this.db
        .select()
        .from(fcmTokens)
        .where(eq(fcmTokens.userId, userId));

      return tokens.map(t => ({
        id: t.id,
        deviceType: t.deviceType,
        deviceInfo: (t.deviceInfo as Record<string, unknown>) || {},
        isActive: t.isActive,
        createdAt: t.createdAt,
        lastUsedAt: t.lastUsedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get user devices:`, error);
      return [];
    }
  }

  /**
   * Update token last used timestamp
   */
  async updateLastUsed(token: string): Promise<void> {
    try {
      await this.db
        .update(fcmTokens)
        .set({ lastUsedAt: new Date() } as Partial<InferInsertModel<typeof fcmTokens>>)
        .where(eq(fcmTokens.token, token));
    } catch (error) {
      this.logger.error(`Failed to update token last used:`, error);
    }
  }

  /**
   * Clean up stale tokens (not used in last 30 days)
   */
  async cleanupStaleTokens(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.db
        .delete(fcmTokens)
        .where(sql`${fcmTokens.lastUsedAt} < ${thirtyDaysAgo}`)
        .returning();

      this.logger.log(`Cleaned up ${result.length} stale FCM tokens`);
      return result.length;
    } catch (error) {
      this.logger.error(`Failed to cleanup stale tokens:`, error);
      return 0;
    }
  }

  /**
   * Get total token count
   */
  async getTotalTokenCount(): Promise<number> {
    try {
      const [result] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(fcmTokens)
        .where(eq(fcmTokens.isActive, true));

      return Number(result.count);
    } catch (error) {
      this.logger.error(`Failed to get token count:`, error);
      return 0;
    }
  }
}
