import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { stories, storyViews } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel } from 'drizzle-orm';
import { QueryParams } from '../../common/types/request.types';

@Injectable()
export class StoriesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async findAll(query: QueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where = and(
      eq(stories.isDeleted, false),
      eq(stories.isArchived, false),
      gte(stories.expiresAt, new Date())
    );

    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(where);

    const data = await this.db
      .select()
      .from(stories)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(stories.createdAt));

    return {
      data,
      pagination: {
        page,
        limit,
        total: Number(totalCount?.count || 0),
        totalPages: Math.ceil(Number(totalCount?.count || 0) / limit),
      },
    };
  }

  async findByUser(userId: number) {
    return await this.db
      .select()
      .from(stories)
      .where(and(
        eq(stories.userId, userId),
        eq(stories.isDeleted, false)
      ))
      .orderBy(desc(stories.createdAt));
  }

  async findArchivedByUser(userId: number, query: QueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where = and(
      eq(stories.userId, userId),
      eq(stories.isDeleted, false),
      eq(stories.isArchived, true)
    );

    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(where);

    const data = await this.db
      .select()
      .from(stories)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(stories.createdAt));

    return {
      data,
      pagination: {
        page,
        limit,
        total: Number(totalCount?.count || 0),
        totalPages: Math.ceil(Number(totalCount?.count || 0) / limit),
      },
    };
  }

  async findOne(id: number) {
    const [story] = await this.db
      .select()
      .from(stories)
      .where(and(eq(stories.id, id), eq(stories.isDeleted, false)))
      .limit(1);

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    return story;
  }

  async create(createStoryDto: Partial<InferSelectModel<typeof stories>> & { userId: number }) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Default 24h expiration

    const [story] = await this.db.insert(stories).values({
      ...createStoryDto,
    }).returning();

    return { message: 'Story created successfully', data: story };
  }

  async remove(id: number, userId: number) {
    const story = await this.findOne(id);

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.db.update(stories)
      .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof stories>>)
      .where(eq(stories.id, id));

    return { message: 'Story deleted successfully' };
  }

  async markAsViewed(id: number, userId: number) {
    await this.findOne(id);

    // Check if already viewed to avoid duplicate entries
    const [existingView] = await this.db
      .select()
      .from(storyViews)
      .where(and(
        eq(storyViews.storyId, id),
        eq(storyViews.userId, userId)
      ))
      .limit(1);

    if (!existingView) {
      await this.db.insert(storyViews).values({
        storyId: id,
        userId: userId,
      });
    }

    return { message: 'Story marked as viewed' };
  }

  async getViewers(id: number, query: QueryParams) {
    const page = (query.page) || 1;
    const limit = (query.limit) || 10;
    const offset = (page - 1) * limit;

    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(storyViews)
      .where(eq(storyViews.storyId, id));

    const viewers = await this.db
      .select()
      .from(storyViews)
      .where(eq(storyViews.storyId, id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(storyViews.viewedAt));

    return {
      data: viewers,
      pagination: {
        page,
        limit,
        total: Number(totalCount?.count || 0),
        totalPages: Math.ceil(Number(totalCount?.count || 0) / limit),
      },
    };
  }

  async archive(id: number, userId: number) {
    const story = await this.findOne(id);

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only archive your own stories');
    }

    await this.db.update(stories)
      .set({ isArchived: true as boolean } as Partial<InferSelectModel<typeof stories>>)
      .where(eq(stories.id, id));

    return { message: 'Story archived successfully' };
  }
}
