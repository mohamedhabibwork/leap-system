import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { eq, and, sql } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { shares, posts, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SharesService {
  private readonly logger = new Logger(SharesService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: number, dto: CreateShareDto) {
    try {
      // 1. Create share record
      // Map DTO field names to schema field names
      const shareData = {
        userId: userId,
        shareableType: dto.shareable_type,
        shareableId: dto.shareable_id,
        shareTypeId: 1, // TODO: Map share_type string to lookup ID
        externalPlatform: dto.share_type === 'link' ? 'external' : dto.share_type,
      } as InferInsertModel<typeof shares>;
      const [share] = await this.db.insert(shares).values(shareData).returning();
      
      // 2. Update share count on entity
      if (dto.shareable_type === 'post') {
        await this.db
          .update(posts)
          .set({ shareCount: sql`${posts.shareCount} + 1` } as Partial<InferInsertModel<typeof posts>>)
          .where(eq(posts.id, dto.shareable_id));
        
        // 3. Get post owner
        const [post] = await this.db
          .select()
          .from(posts)
          .where(eq(posts.id, dto.shareable_id))
          .limit(1);
        
        if (!post) {
          this.logger.warn(`Post ${dto.shareable_id} not found for share`);
          return share;
        }
        
        // 4. Get sharer info
        const [sharer] = await this.db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (!sharer) {
          this.logger.warn(`Sharer user ${userId} not found`);
          return share;
        }

        const sharerName = `${sharer.firstName || ''} ${sharer.lastName || ''}`.trim() || sharer.username;
        
        // 5. Notify post owner (don't notify self-shares)
        if (post.userId !== userId) {
          const [shareNotifType] = await this.db
            .select({ id: lookups.id })
            .from(lookups)
            .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
            .where(and(
              eq(lookupTypes.code, 'notification_type'),
              eq(lookups.code, 'post_share')
            ))
            .limit(1);

          if (shareNotifType) {
            await this.notificationsService.sendMultiChannelNotification({
              userId: post.userId,
              notificationTypeId: shareNotifType.id,
              title: 'Post Shared',
              message: `${sharerName} shared your post`,
              linkUrl: `/posts/${post.id}`,
              channels: ['database', 'websocket'], // Lower priority - no email/push by default
            });
            
            this.logger.log(`Share notification sent to post owner ${post.userId}`);
          }
        }
      }
      
      return share;
    } catch (error) {
      this.logger.error('Error creating share:', error);
      throw error;
    }
  }

  async findByUser(userId: number) {
    return await this.db.select().from(shares).where(and(eq(shares.userId, userId), eq(shares.isDeleted, false)));
  }

  async findByShareable(type: string, id: number) {
    return await this.db.select().from(shares).where(and(eq(shares.shareableType, type), eq(shares.shareableId, id), eq(shares.isDeleted, false)));
  }
}
