import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { pages, pageFollows, pageLikes, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto, PageBulkAction } from './dto/bulk-page-operation.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreatePageDto & { createdBy: number }) {
    const [page] = await this.db.insert(pages).values(dto as any).returning();
    return page;
  }

  async findAllAdmin(query: AdminPageQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    let conditions: any[] = [eq(pages.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          ilike(pages.name, `%${search}%`),
          ilike(pages.description, `%${search}%`)
        )
      );
    }

    if (query.categoryId) {
      conditions.push(eq(pages.categoryId, query.categoryId));
    }

    if (query.createdBy) {
      conditions.push(eq(pages.createdBy, query.createdBy));
    }

    const whereClause = and(...conditions);
    const orderByClause = sortOrder === 'asc' ? asc(pages[sortBy]) : desc(pages[sortBy]);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(pages)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(pages)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const [page] = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)))
      .limit(1);

    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: number, dto: UpdatePageDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(pages)
      .set({ ...dto, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.db
      .update(pages)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(pages.id, id));
    return { success: true };
  }

  async verifyPage(id: number, isVerified: boolean) {
    const [updated] = await this.db
      .update(pages)
      .set({ isVerified: isVerified as any, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async setFeatured(id: number, isFeatured: boolean) {
    const [updated] = await this.db
      .update(pages)
      .set({ isFeatured: isFeatured as any, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        verified: sql<number>`count(*) filter (where is_verified = true)`,
        featured: sql<number>`count(*) filter (where is_featured = true)`,
      })
      .from(pages)
      .where(eq(pages.isDeleted, false));

    return stats;
  }

  async bulkOperation(dto: BulkPageOperationDto) {
    const { ids, action } = dto;
    let processedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (const id of ids) {
      try {
        switch (action) {
          case PageBulkAction.DELETE:
            await this.remove(id);
            break;
          case PageBulkAction.VERIFY:
            await this.verifyPage(id, true);
            break;
          case PageBulkAction.UNVERIFY:
            await this.verifyPage(id, false);
            break;
          case PageBulkAction.FEATURE:
            await this.setFeatured(id, true);
            break;
          case PageBulkAction.UNFEATURE:
            await this.setFeatured(id, false);
            break;
        }
        processedCount++;
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    return {
      success: true,
      processedCount,
      failedCount: errors.length,
      errors,
    };
  }

  async exportToCsv(query: AdminPageQueryDto) {
    const result = await this.findAllAdmin({ ...query, limit: 10000 });
    // CSV export logic would go here
    return { data: result.data, format: 'csv' };
  }

  async followPage(pageId: number, userId: number) {
    try {
      // 1. Check if already following
      const [existing] = await this.db
        .select()
        .from(pageFollows)
        .where(and(
          eq(pageFollows.pageId, pageId),
          eq(pageFollows.userId, userId),
          eq(pageFollows.isDeleted, false)
        ))
        .limit(1);

      if (existing) {
        return { success: false, message: 'Already following this page' };
      }

      // 2. Create follow record
      const [follow] = await this.db.insert(pageFollows).values({
        pageId,
        userId,
      } as any).returning();

      // 3. Update follower count
      await this.db
        .update(pages)
        .set({ followerCount: sql`${pages.followerCount} + 1` } as any)
        .where(eq(pages.id, pageId));

      // 4. Get page owner and follower info
      const [page] = await this.db
        .select()
        .from(pages)
        .where(eq(pages.id, pageId))
        .limit(1);

      if (!page) {
        this.logger.warn(`Page ${pageId} not found`);
        return { success: true, message: 'Followed page successfully' };
      }

      const [follower] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!follower) {
        this.logger.warn(`Follower user ${userId} not found`);
        return { success: true, message: 'Followed page successfully' };
      }

      const followerName = `${follower.firstName || ''} ${follower.lastName || ''}`.trim() || follower.username;

      // 5. Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'page_follow')
        ))
        .limit(1);

      // 6. Notify page owner
      if (page.createdBy !== userId && notifType) {
        await this.notificationsService.sendMultiChannelNotification({
          userId: page.createdBy,
          notificationTypeId: notifType.id,
          title: 'New Page Follower',
          message: `${followerName} started following ${page.name}`,
          linkUrl: `/pages/${pageId}/followers`,
          channels: ['database', 'websocket'], // Lower priority
        });

        this.logger.log(`Page follow notification sent to page owner ${page.createdBy}`);
      }

      return { success: true, message: 'Followed page successfully' };
    } catch (error) {
      this.logger.error('Error following page:', error);
      throw error;
    }
  }

  async likePage(pageId: number, userId: number) {
    try {
      // 1. Check if already liked
      const [existing] = await this.db
        .select()
        .from(pageLikes)
        .where(and(
          eq(pageLikes.pageId, pageId),
          eq(pageLikes.userId, userId),
          eq(pageLikes.isDeleted, false)
        ))
        .limit(1);

      if (existing) {
        // Unlike
        await this.db
          .update(pageLikes)
          .set({ isDeleted: true, deletedAt: new Date() })
          .where(eq(pageLikes.id, existing.id));

        await this.db
          .update(pages)
          .set({ likeCount: sql`GREATEST(${pages.likeCount} - 1, 0)` } as any)
          .where(eq(pages.id, pageId));

        return { success: true, action: 'unliked' };
      }

      // 2. Create like record
      const [like] = await this.db.insert(pageLikes).values({
        pageId,
        userId,
      } as any).returning();

      // 3. Update like count
      await this.db
        .update(pages)
        .set({ likeCount: sql`${pages.likeCount} + 1` } as any)
        .where(eq(pages.id, pageId));

      // 4. Get page owner and liker info
      const [page] = await this.db
        .select()
        .from(pages)
        .where(eq(pages.id, pageId))
        .limit(1);

      if (!page) {
        this.logger.warn(`Page ${pageId} not found`);
        return { success: true, action: 'liked' };
      }

      const [liker] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!liker) {
        this.logger.warn(`Liker user ${userId} not found`);
        return { success: true, action: 'liked' };
      }

      const likerName = `${liker.firstName || ''} ${liker.lastName || ''}`.trim() || liker.username;

      // 5. Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'page_like')
        ))
        .limit(1);

      // 6. Notify page owner
      if (page.createdBy !== userId && notifType) {
        await this.notificationsService.sendMultiChannelNotification({
          userId: page.createdBy,
          notificationTypeId: notifType.id,
          title: 'Page Liked',
          message: `${likerName} liked your page ${page.name}`,
          linkUrl: `/pages/${pageId}`,
          channels: ['database', 'websocket'], // Lower priority
        });

        this.logger.log(`Page like notification sent to page owner ${page.createdBy}`);
      }

      return { success: true, action: 'liked' };
    } catch (error) {
      this.logger.error('Error liking page:', error);
      throw error;
    }
  }

  async unfollowPage(pageId: number, userId: number) {
    await this.db
      .update(pageFollows)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(and(
        eq(pageFollows.pageId, pageId),
        eq(pageFollows.userId, userId)
      ));

    await this.db
      .update(pages)
      .set({ followerCount: sql`GREATEST(${pages.followerCount} - 1, 0)` } as any)
      .where(eq(pages.id, pageId));

    return { success: true, message: 'Unfollowed page successfully' };
  }
}
