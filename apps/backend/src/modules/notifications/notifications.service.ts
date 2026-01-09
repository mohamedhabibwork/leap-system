import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { notifications, users } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EmailService } from './email.service';
import { FCMService } from './fcm.service';
import { NotificationsGateway } from './notifications.gateway';

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
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly emailService: EmailService,
    private readonly fcmService: FCMService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a notification in the database
   */
  async create(dto: CreateNotificationDto) {
    const [notification] = await this.db.insert(notifications).values({
      ...dto,
      isRead: false,
    } as any).returning();
    
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
    categories: Record<string, { email: boolean; push: boolean }>;
  }> {
    // TODO: Fetch from user preferences table
    // For now, return default preferences (all enabled)
    return {
      emailEnabled: true,
      pushEnabled: true,
      categories: {
        lms: { email: true, push: true },
        jobs: { email: true, push: true },
        social: { email: true, push: true },
        tickets: { email: true, push: true },
        payments: { email: true, push: true },
        system: { email: true, push: true },
      },
    };
  }

  /**
   * Get user's FCM token
   */
  private async getUserFCMToken(userId: number): Promise<string | null> {
    // TODO: Fetch from user_devices or user_settings table
    // For now, return null (no FCM token available)
    return null;
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
    } as any).where(eq(notifications.id, id));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number) {
    await this.db.update(notifications).set({ 
      isRead: true,
      readAt: new Date(),
    } as any).where(
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
    } as any).where(eq(notifications.id, id));
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
}
