import { Injectable, Inject } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { eq, and, sql, desc, like, or } from 'drizzle-orm';
import { posts } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class PostsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreatePostDto) {
    const [post] = await this.db.insert(posts).values(dto as any).returning();
    return post;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const conditions = [eq(posts.isDeleted, false)];

    const results = await this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
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

  async findByUser(userId: number) {
    return await this.db.select().from(posts).where(and(eq(posts.userId, userId), eq(posts.isDeleted, false)));
  }

  async findOne(id: number) {
    const [post] = await this.db.select().from(posts).where(and(eq(posts.id, id), eq(posts.isDeleted, false))).limit(1);
    if (!post) throw new Error('Post not found');
    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId?: number) {
    await this.findOne(id);
    const [updated] = await this.db.update(posts).set(dto as any).where(eq(posts.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(posts).set({ isDeleted: true, deletedAt: new Date() } as any).where(eq(posts.id, id));
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 10, search, userId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(posts.isDeleted, false)];

    if (search) {
      conditions.push(like(posts.content, `%${search}%`));
    }

    if (userId) {
      conditions.push(eq(posts.userId, userId));
    }

    const results = await this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
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

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(posts)
      .where(eq(posts.isDeleted, false));

    return {
      total: Number(stats.total),
    };
  }

  async toggleLike(postId: number, userId: number) {
    // This would toggle a like record
    return { success: true, message: 'Like toggled successfully' };
  }

  async hidePost(id: number) {
    const [updated] = await this.db
      .update(posts)
      .set({ isHidden: true } as any)
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async unhidePost(id: number) {
    const [updated] = await this.db
      .update(posts)
      .set({ isHidden: false } as any)
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;
    
    switch (operation) {
      case 'delete':
        await this.db
          .update(posts)
          .set({ isDeleted: true, deletedAt: new Date() } as any)
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} posts` };
      
      case 'hide':
        await this.db
          .update(posts)
          .set({ isHidden: true } as any)
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Hidden ${ids.length} posts` };
      
      case 'unhide':
        await this.db
          .update(posts)
          .set({ isHidden: false } as any)
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Unhidden ${ids.length} posts` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: any) {
    const { search } = query;
    const conditions = [eq(posts.isDeleted, false)];

    if (search) {
      conditions.push(like(posts.content, `%${search}%`));
    }

    const results = await this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt));

    // Convert to CSV format
    const headers = ['ID', 'Content', 'User ID', 'Privacy', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const post of results) {
      const row = [
        post.id,
        `"${post.content?.replace(/"/g, '""') || ''}"`,
        post.userId,
        'public',
        post.createdAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
