import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import { notifications, users, userNotificationPreferences, fcmTokens } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { InferInsertModel } from 'drizzle-orm';
import { EmailService } from './email.service';
import { FCMService } from './fcm.service';
import { NotificationsGateway } from './notifications.gateway';
import * as schema from '@leap-lms/database';

export type NotificationChannel = 'database' | 'email' | 'fcm' | 'websocket';

export interface MultiChannelNotificationData {
  userId: number;
  notificationTypeId: number;
  title: string;
  message: string;
  linkUrl?: string;
  channels?: NotificationChannel[];
  emailData?: any;
  pushData?: any;
}

export interface BulkNotificationData {
  userIds: number[];
  notificationTypeId: number;
  title: string;
  message: string;
  linkUrl?: string;
  channels?: NotificationChannel[];
  emailData?: any;
  pushData?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly emailService: EmailService,
    private readonly fcmService: FCMService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a notification in the database
   */
  async create(dto: CreateNotificationDto) {
    const notificationData: InferInsertModel<typeof notifications> = {
      ...dto,
      isRead: false,
    };
    
    const [notification] = await this.db.insert(notifications).values(notificationData).returning();
    
    return notification;
  }

  /**
   * Send multi-channel notification (Database + Email + FCM + WebSocket)
   */
  async sendMultiChannelNotification(data: MultiChannelNotificationData): Promise<void> {
    const {
      userId,
      notificationTypeId,
      title,
      message,
      linkUrl,
      channels = ['database', 'websocket'],
      emailData,
      pushData,
    } = data;

    try {
      // Get user information
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        this.logger.warn(`User ${userId} not found. Skipping notification.`);
        return;
      }

      // Get user notification preferences
      const preferences = await this.getUserNotificationPreferences(userId);

      // 1. Database Channel (always store)
      let dbNotification = null;
      if (channels.includes('database')) {
        dbNotification = await this.create({
          userId,
          notificationTypeId,
          title,
          message,
          linkUrl,
        });
        this.logger.log(`[DB] Notification saved for user ${userId}`);
      }

      // 2. WebSocket Channel (real-time)
      if (channels.includes('websocket')) {
        this.notificationsGateway.sendNotification(userId, {
          id: dbNotification?.id,
          userId,
          type: notificationTypeId,
          title,
          message,
          linkUrl,
          createdAt: new Date(),
          isRead: false,
        });
        this.logger.log(`[WebSocket] Notification sent to user ${userId}`);
      }

      // 3. Email Channel (if enabled in preferences)
      if (channels.includes('email') && preferences.emailEnabled && user.email) {
        try {
          // The emailData should contain all necessary data for the specific email template
          if (emailData && emailData.templateMethod) {
            const method = emailData.templateMethod;
            if (typeof this.emailService[method] === 'function') {
              await this.emailService[method](user.email, emailData.data);
              this.logger.log(`[Email] Sent to ${user.email} via ${method}`);
            }
          }
        } catch (error) {
          this.logger.error(`[Email] Failed to send to ${user.email}:`, error);
        }
      }

      // 4. FCM Push Channel (if enabled in preferences and user has FCM token)
      if (channels.includes('fcm') && preferences.pushEnabled) {
        try {
          // Get user's FCM token (would need to be stored in user profile or separate table)
          const fcmToken = await this.getUserFCMToken(userId);
          if (fcmToken) {
            await this.fcmService.sendNotification(
              fcmToken,
              title,
              message,
              pushData || { notificationId: dbNotification?.id?.toString(), linkUrl }
            );
            this.logger.log(`[FCM] Push sent to user ${userId}`);
          }
        } catch (error) {
          this.logger.error(`[FCM] Failed to send push to user ${userId}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send multi-channel notification:`, error);
      throw error;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(data: BulkNotificationData): Promise<void> {
    const { userIds, ...notificationData } = data;

    this.logger.log(`Sending bulk notifications to ${userIds.length} users`);

    // Process in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(userId =>
          this.sendMultiChannelNotification({
            ...notificationData,
            userId,
          })
        )
      );

      this.logger.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(userIds.length / batchSize)}`);
    }

    this.logger.log(`Bulk notifications completed for ${userIds.length} users`);
  }

  /**
   * Send notification to users with a specific role
   */
  async sendNotificationToRole(
    roleName: string,
    notificationData: Omit<MultiChannelNotificationData, 'userId'>
  ): Promise<void> {
    // Get all users with the specified role
    const usersWithRole = await this.db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.isDeleted, false),
          sql`${users.id} IN (
            SELECT user_id FROM user_roles 
            WHERE role_id IN (
              SELECT id FROM lookups 
              WHERE code = ${roleName} AND lookup_type_id = (
                SELECT id FROM lookup_types WHERE code = 'user_role'
              )
            )
          )`
        )
      );

    const userIds = usersWithRole.map(u => u.id);

    if (userIds.length > 0) {
      await this.sendBulkNotifications({
        ...notificationData,
        userIds,
      });
    } else {
      this.logger.warn(`No users found with role: ${roleName}`);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId: number): Promise<{
    emailEnabled: boolean;
    pushEnabled: boolean;
    websocketEnabled: boolean;
    notifyOnPostLikes: boolean;
    notifyOnComments: boolean;
    notifyOnCommentReplies: boolean;
    notifyOnShares: boolean;
    notifyOnFriendRequests: boolean;
    notifyOnFriendRequestAccepted: boolean;
    notifyOnGroupJoins: boolean;
    notifyOnPageFollows: boolean;
    notifyOnMentions: boolean;
    notifyOnEventInvitations: boolean;
    categories: Record<string, { email: boolean; push: boolean; websocket: boolean }>;
  }> {
    const [prefs] = await this.db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1);
    
    if (!prefs) {
      // Return defaults if not set
      return this.getDefaultPreferences();
    }
    
    return {
      emailEnabled: prefs.emailEnabled,
      pushEnabled: prefs.pushEnabled,
      websocketEnabled: prefs.websocketEnabled,
      notifyOnPostLikes: prefs.notifyOnPostLikes,
      notifyOnComments: prefs.notifyOnComments,
      notifyOnCommentReplies: prefs.notifyOnCommentReplies,
      notifyOnShares: prefs.notifyOnShares,
      notifyOnFriendRequests: prefs.notifyOnFriendRequests,
      notifyOnFriendRequestAccepted: prefs.notifyOnFriendRequestAccepted,
      notifyOnGroupJoins: prefs.notifyOnGroupJoins,
      notifyOnPageFollows: prefs.notifyOnPageFollows,
      notifyOnMentions: prefs.notifyOnMentions,
      notifyOnEventInvitations: prefs.notifyOnEventInvitations,
      categories: prefs.categories  || this.getDefaultCategories(),
    };
  }

  private getDefaultPreferences() {
    return {
      emailEnabled: true,
      pushEnabled: true,
      websocketEnabled: true,
      notifyOnPostLikes: true,
      notifyOnComments: true,
      notifyOnCommentReplies: true,
      notifyOnShares: true,
      notifyOnFriendRequests: true,
      notifyOnFriendRequestAccepted: true,
      notifyOnGroupJoins: true,
      notifyOnPageFollows: true,
      notifyOnMentions: true,
      notifyOnEventInvitations: true,
      categories: this.getDefaultCategories(),
    };
  }

  private getDefaultCategories() {
    return {
      social: { email: true, push: true, websocket: true },
      lms: { email: true, push: true, websocket: true },
      jobs: { email: true, push: true, websocket: true },
      events: { email: true, push: true, websocket: true },
      payments: { email: true, push: true, websocket: true },
      system: { email: true, push: true, websocket: true },
    };
  }

  async updateUserNotificationPreferences(userId: number, preferences: any) {
    // Check if preferences exist
    const [existing] = await this.db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1);

    if (existing) {
      // Update existing preferences
      const [updated] = await this.db
        .update(userNotificationPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(userNotificationPreferences.userId, userId))
        .returning();
      
      this.logger.log(`Updated notification preferences for user ${userId}`);
      return updated;
    } else {
      // Create new preferences
      const [created] = await this.db
        .insert(userNotificationPreferences)
        .values({
          userId,
          ...preferences,
        } )
        .returning();
      
      this.logger.log(`Created notification preferences for user ${userId}`);
      return created;
    }
  }

  /**
   * Get user's FCM token
   */
  private async getUserFCMToken(userId: number): Promise<string | null> {
    const [tokenRecord] = await this.db
      .select({ token: fcmTokens.token })
      .from(fcmTokens)
      .where(and(eq(fcmTokens.userId, userId), eq(fcmTokens.isActive, true)))
      .orderBy(desc(fcmTokens.lastUsedAt))
      .limit(1);

    return tokenRecord?.token || null;
  }

  /**
   * Find notifications by user
   */
  async findByUser(userId: number) {
    return await this.db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isDeleted, false))
    ).orderBy(sql`${notifications.createdAt} DESC`);
  }

  /**
   * Find unread notifications
   */
  async findUnread(userId: number) {
    return await this.db.select().from(notifications).where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isDeleted, false)
      )
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number) {
    await this.db.update(notifications).set({ 
      isRead: true,
      readAt: new Date(),
    } ).where(eq(notifications.id, id));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number) {
    await this.db.update(notifications).set({ 
      isRead: true,
      readAt: new Date(),
    } ).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  }

  /**
   * Soft delete notification
   */
  async remove(id: number) {
    await this.db.update(notifications).set({ 
      isDeleted: true,
      deletedAt: new Date(),
    } ).where(eq(notifications.id, id));
  }

  /**
   * Get notification statistics for a user
   */
  async getStatistics(userId: number) {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        unread: sql<number>`count(*) filter (where ${notifications.isRead} = false)`,
        read: sql<number>`count(*) filter (where ${notifications.isRead} = true)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isDeleted, false)
        )
      );

    return {
      total: Number(stats.total),
      unread: Number(stats.unread),
      read: Number(stats.read),
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false)
        )
      );

    return Number(result.count);
  }

  /**
   * Bulk delete notifications
   */
  async bulkDelete(notificationIds: number[], userId: number): Promise<void> {
    if (notificationIds.length === 0) {
      return;
    }

    await this.db
      .update(notifications)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      } )
      .where(
        and(
          inArray(notifications.id, notificationIds),
          eq(notifications.userId, userId) // Ensure user can only delete their own notifications
        )
      );

    this.logger.log(`Bulk deleted ${notificationIds.length} notifications for user ${userId}`);
  }

  /**
   * Delete all user notifications
   */
  async deleteAll(userId: number): Promise<{ message: string; deleted: number }> {
    const result = await this.db
      .update(notifications)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      } )
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isDeleted, false)
        )
      )
      .returning({ id: notifications.id });

    this.logger.log(`Deleted all notifications for user ${userId} (${result.length} notifications)`);

    return { message: 'All notifications deleted', deleted: result.length };
  }

  /**
   * Get available notification types for filtering
   */
  async getNotificationTypes() {
    // Return predefined notification categories and types
    return {
      categories: [
        {
          id: 'lms',
          name: 'Learning & Courses',
          types: [
            { id: 'course_enrollment', name: 'Course Enrollment' },
            { id: 'course_completion', name: 'Course Completion' },
            { id: 'assignment_due', name: 'Assignment Due' },
            { id: 'quiz_available', name: 'Quiz Available' },
            { id: 'grade_published', name: 'Grade Published' },
          ],
        },
        {
          id: 'social',
          name: 'Social',
          types: [
            { id: 'comment', name: 'New Comment' },
            { id: 'like', name: 'New Like' },
            { id: 'follow', name: 'New Follower' },
            { id: 'mention', name: 'Mentioned' },
            { id: 'message', name: 'New Message' },
          ],
        },
        {
          id: 'jobs',
          name: 'Jobs & Career',
          types: [
            { id: 'job_application', name: 'Job Application' },
            { id: 'job_offer', name: 'Job Offer' },
            { id: 'interview_scheduled', name: 'Interview Scheduled' },
          ],
        },
        {
          id: 'payments',
          name: 'Payments',
          types: [
            { id: 'payment_received', name: 'Payment Received' },
            { id: 'payment_refunded', name: 'Payment Refunded' },
            { id: 'subscription_renewed', name: 'Subscription Renewed' },
          ],
        },
        {
          id: 'system',
          name: 'System',
          types: [
            { id: 'system_update', name: 'System Update' },
            { id: 'maintenance', name: 'Maintenance Alert' },
            { id: 'announcement', name: 'Announcement' },
          ],
        },
      ],
    };
  }
}
