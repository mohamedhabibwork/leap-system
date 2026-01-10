import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { eq, and, sql, desc, like, or } from 'drizzle-orm';
import { posts, postReactions, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreatePostDto) {
    // Map post_type string to postTypeId from lookups
    // The lookup codes match the DTO values directly
    const postTypeCode = dto.post_type; // text, image, video, link
    
    // Map visibility string to lookups
    // DTO uses 'friends' but lookup code is 'friends'
    const visibilityCode = dto.visibility; // public, friends, private

    // Get post type lookup
    const [postTypeLookup] = await this.db
      .select()
      .from(lookups)
      .where(eq(lookups.code, postTypeCode))
      .limit(1);

    if (!postTypeLookup) {
      throw new Error(`Invalid post type: ${dto.post_type}`);
    }

    // Get visibility lookup
    const [visibilityLookup] = await this.db
      .select()
      .from(lookups)
      .where(eq(lookups.code, visibilityCode))
      .limit(1);

    if (!visibilityLookup) {
      throw new Error(`Invalid visibility: ${dto.visibility}`);
    }

    // Map DTO to database schema
    const postData: any = {
      content: dto.content,
      postTypeId: postTypeLookup.id,
      visibilityId: visibilityLookup.id,
      userId: (dto as any).userId, // Added by controller
    };

    // Only add groupId if group_id is provided
    if (dto.group_id) {
      postData.groupId = dto.group_id;
    }

    // Only add pageId if page_id is provided
    if (dto.page_id) {
      postData.pageId = dto.page_id;
    }

    const [post] = await this.db.insert(posts).values(postData).returning();
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
    try {
      // 1. Get the reaction type ID for 'like'
      const [reactionType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'reaction_type'),
          eq(lookups.code, 'like')
        ))
        .limit(1);

      if (!reactionType) {
        this.logger.error('Like reaction type not found in lookups');
        return { success: false, message: 'Reaction type not configured' };
      }

      // 2. Check if reaction exists
      const [existing] = await this.db
        .select()
        .from(postReactions)
        .where(and(
          eq(postReactions.postId, postId),
          eq(postReactions.userId, userId),
          eq(postReactions.isDeleted, false)
        ))
        .limit(1);

      let action: 'liked' | 'unliked';

      if (existing) {
        // Unlike - soft delete
        await this.db
          .update(postReactions)
          .set({ isDeleted: true, deletedAt: new Date() })
          .where(eq(postReactions.id, existing.id));
        
        // Decrement count
        await this.db
          .update(posts)
          .set({ reactionCount: sql`GREATEST(${posts.reactionCount} - 1, 0)` })
          .where(eq(posts.id, postId));
        
        action = 'unliked';
        this.logger.log(`User ${userId} unliked post ${postId}`);
      } else {
        // Like - create reaction
        await this.db.insert(postReactions).values({
          postId,
          userId,
          reactionTypeId: reactionType.id,
          isDeleted: false,
        } as any);
        
        // Increment count
        await this.db
          .update(posts)
          .set({ reactionCount: sql`${posts.reactionCount} + 1` })
          .where(eq(posts.id, postId));
        
        action = 'liked';
        this.logger.log(`User ${userId} liked post ${postId}`);
        
        // 3. Get post owner
        const [post] = await this.db
          .select()
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);
        
        if (!post) {
          return { success: false, message: 'Post not found' };
        }
        
        // 4. Don't notify if user liked their own post
        if (post.userId !== userId) {
          // 5. Get reactor's info
          const [reactor] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          
          // 6. Get notification type ID
          const [notificationType] = await this.db
            .select({ id: lookups.id })
            .from(lookups)
            .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
            .where(and(
              eq(lookupTypes.code, 'notification_type'),
              eq(lookups.code, 'post_reaction')
            ))
            .limit(1);
          
          if (reactor && notificationType) {
            // 7. Trigger notification
            const reactorName = `${reactor.firstName || ''} ${reactor.lastName || ''}`.trim() || reactor.username;
            
            await this.notificationsService.sendMultiChannelNotification({
              userId: post.userId,
              notificationTypeId: notificationType.id,
              title: 'New Reaction',
              message: `${reactorName} liked your post`,
              linkUrl: `/posts/${postId}`,
              channels: ['database', 'websocket', 'fcm', 'email'],
              emailData: {
                templateMethod: 'sendPostReactionEmail',
                data: {
                  userName: 'User',
                  reactorName,
                  reactionType: 'like',
                  postUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${postId}`,
                  totalReactions: (post.reactionCount || 0) + 1,
                }
              },
              pushData: {
                type: 'post_like',
                postId: postId.toString(),
              }
            });
            
            this.logger.log(`Notification sent to user ${post.userId} for post ${postId} like`);
          }
        }
      }

      // Get updated reaction count
      const [updatedPost] = await this.db
        .select({ reactionCount: posts.reactionCount })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      return { 
        success: true, 
        action,
        reactionCount: updatedPost?.reactionCount || 0,
        message: `Post ${action} successfully`
      };
    } catch (error) {
      this.logger.error(`Error toggling like for post ${postId}:`, error);
      throw error;
    }
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
