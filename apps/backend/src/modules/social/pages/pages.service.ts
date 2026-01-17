import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, or, ilike, desc, asc, sql, gte } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm';
import { pages, pageFollows, pageLikes, users, lookups, lookupTypes, posts } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto, PageBulkAction } from './dto/bulk-page-operation.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { LookupValidator } from '../../../common/utils/lookup-validator';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { generateSlug } from 'src/common/utils/slug.util';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
    private readonly lookupValidator: LookupValidator,
  ) {}

  async create(dto: CreatePageDto & { createdBy: number }) {
    // Validate optional categoryId if provided
    // Note: Based on the schema, pages.categoryId references lookups.id
    // We validate that the lookup exists (without strict type checking since page categories
    // might use a general category lookup type)
    if (dto.categoryId) {
      // Check if lookup exists (basic validation)
      const [lookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .where(
          and(
            eq(lookups.id, dto.categoryId),
            eq(lookups.isDeleted, false),
            eq(lookups.isActive, true),
          ),
        )
        .limit(1);

      if (!lookup) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} not found`,
        );
      }
    }

    const slug = dto.slug || generateSlug(dto.name);

    const pageData: InferInsertModel<typeof pages> = {
      ...dto,
      slug,
    };

    const [page] = await this.db.insert(pages).values(pageData).returning();
    return page;
  }

  async findAllAdmin(query: AdminPageQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(pages.isDeleted, false)];

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
    // Get total count
    const [totalResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(pages)
      .where(eq(pages.isDeleted, false));

    const total = Number(totalResult?.count || 0);

    // Get verified count (if column exists)
    let verified = 0;
    try {
      const [verifiedResult] = await this.db
        .select({ count: sql<number>`count(*) filter (where is_verified = true)` })
        .from(pages)
        .where(eq(pages.isDeleted, false));
      verified = Number(verifiedResult?.count || 0);
    } catch (error) {
      // Column doesn't exist, return 0
    }

    // Get featured count (if column exists)
    let featured = 0;
    try {
      const [featuredResult] = await this.db
        .select({ count: sql<number>`count(*) filter (where is_featured = true)` })
        .from(pages)
        .where(eq(pages.isDeleted, false));
      featured = Number(featuredResult?.count || 0);
    } catch (error) {
      // Column doesn't exist, return 0
    }

    return {
      total,
      verified,
      featured,
    };
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

  async findByUser(userId: number, query?: any) {
    const { page = 1, limit = 100, search } = query || {};
    const offset = (page - 1) * limit;
    const conditions = [eq(pages.createdBy, userId), eq(pages.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          ilike(pages.name, `%${search}%`),
          ilike(pages.description, `%${search}%`)
        )
      );
    }

    const results = await this.db
      .select()
      .from(pages)
      .where(and(...conditions))
      .orderBy(desc(pages.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(pages)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getAnalytics(pageId: number, userId: number) {
    // Verify user owns the page
    const page = await this.findOne(pageId);
    if (page.createdBy !== userId) {
      throw new NotFoundException('Page not found or access denied');
    }

    // Get page stats
    const pagePosts = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.pageId, pageId), eq(posts.isDeleted, false)));

    const [pageStats] = await this.db
      .select({
        followerCount: pages.followerCount,
        likeCount: pages.likeCount,
      })
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    // Get recent engagement data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = pagePosts.filter((p: any) => 
      p.createdAt && new Date(p.createdAt) >= sevenDaysAgo
    );

    // Group by date
    const engagementByDate: Record<string, { views: number; likes: number; shares: number; comments: number }> = {};
    recentPosts.forEach((post: any) => {
      const date = post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '';
      if (!engagementByDate[date]) {
        engagementByDate[date] = { views: 0, likes: 0, shares: 0, comments: 0 };
      }
      engagementByDate[date].views += Number(post.viewCount || 0);
      engagementByDate[date].likes += Number(post.reactionCount || 0);
      engagementByDate[date].shares += Number(post.shareCount || 0);
      engagementByDate[date].comments += Number(post.commentCount || 0);
    });

    const engagement = Object.entries(engagementByDate)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top posts
    const topPostsData = pagePosts
      .map((post: any) => ({
        id: post.id,
        content: post.content || '',
        views: Number(post.viewCount || 0),
        likes: Number(post.reactionCount || 0),
        shares: Number(post.shareCount || 0),
        comments: Number(post.commentCount || 0),
        totalEngagement: Number(post.viewCount || 0) + Number(post.reactionCount || 0) + Number(post.shareCount || 0) + Number(post.commentCount || 0),
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10)
      .map(({ totalEngagement, ...post }) => post);

    return {
      overview: {
        totalFollowers: Number(pageStats?.followerCount || 0),
        totalLikes: Number(pageStats?.likeCount || 0),
        totalPosts: pagePosts.length,
        engagementRate: pageStats?.followerCount ? 
          ((pagePosts.reduce((sum: number, p: any) => sum + Number(p.reactionCount || 0) + Number(p.commentCount || 0), 0) / pagePosts.length) / Number(pageStats.followerCount)) * 100 : 0,
      },
      engagement,
      topPosts: topPostsData,
    };
  }

  async getFollowers(pageId: number, query?: any) {
    const { page = 1, limit = 50, search } = query || {};
    const offset = (page - 1) * limit;

    let conditions: any[] = [
      eq(pageFollows.pageId, pageId),
      eq(pageFollows.isDeleted, false),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      );
    }

    const results = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        avatar: users.avatarUrl,
        bio: users.bio,
      })
      .from(pageFollows)
      .innerJoin(users, eq(pageFollows.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(pageFollows)
      .where(and(eq(pageFollows.pageId, pageId), eq(pageFollows.isDeleted, false)));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }
}
