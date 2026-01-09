import { Injectable, Inject } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { eq, and, sql } from 'drizzle-orm';
import { notifications } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class NotificationsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateNotificationDto) {
    const [notification] = await this.db.insert(notifications).values({
      ...dto,
      isRead: false,
    } as any).returning();
    
    // Mock multi-channel delivery
    await this.deliverNotification(notification);
    
    return notification;
  }

  private async deliverNotification(notification: any) {
    // Mock notification delivery
    console.log(`[NOTIFICATION] Sent to user ${notification.userId}: ${notification.title}`);
  }

  async findByUser(userId: number) {
    return await this.db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isDeleted, false))
    ).orderBy(sql`${notifications.createdAt} DESC`);
  }

  async findUnread(userId: number) {
    return await this.db.select().from(notifications).where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isDeleted, false)
      )
    );
  }

  async markAsRead(id: number) {
    await this.db.update(notifications).set({ isRead: true } as any).where(eq(notifications.id, id));
  }

  async markAllAsRead(userId: number) {
    await this.db.update(notifications).set({ isRead: true } as any).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  }

  async remove(id: number) {
    await this.db.update(notifications).set({ isDeleted: true } as any).where(eq(notifications.id, id));
  }
}
