import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { AdminPostQueryDto } from './dto/admin-post-query.dto';
import { BulkPostOperationDto } from './dto/bulk-post-operation.dto';
import { eq, and, sql, desc, like, or, inArray } from 'drizzle-orm';
import { posts, postReactions, users, lookups, lookupTypes, mediaLibrary, groups, pages } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { NotificationsService } from '../../notifications/notifications.service';
import { MinioService } from '../../media/minio.service';
import { R2Service } from '../../media/r2.service';
import { LookupTypeCode, MediaProviderCode } from '@leap-lms/shared-types';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  private storageProvider: 'minio' | 'r2';

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioService,
    private readonly r2Service: R2Service,
  ) {
    // Choose storage provider based on configuration
    this.storageProvider = this.configService.get<string>('STORAGE_PROVIDER') === 'r2' ? 'r2' : 'minio';
  }

  async create(dto: CreatePostDto & { userId: number }) {
    // Map post_type string to postTypeId from lookups
    // The lookup codes match the DTO values directly
    const postTypeCode = dto.post_type; // text, image, video, link
    
    // Map visibility string to lookups
    // DTO uses 'friends' but lookup code is 'friends'
    const visibilityCode = dto.visibility; // public, friends, private

    // First, check if the lookup type exists
    const [postTypeLookupType] = await this.db
      .select({ id: lookupTypes.id, code: lookupTypes.code })
      .from(lookupTypes)
      .where(eq(lookupTypes.code, LookupTypeCode.POST_TYPE))
      .limit(1);

    if (!postTypeLookupType) {
      this.logger.error('Lookup type "post_type" not found in database. Please run the database seeder.');
      throw new BadRequestException(
        'Post type lookup configuration is missing. Please contact the administrator or run the database seeder.'
      );
    }

    // Get post type lookup - must filter by lookup type
    const [postTypeLookup] = await this.db
      .select({ id: lookups.id, code: lookups.code })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, LookupTypeCode.POST_TYPE),
        eq(lookups.code, postTypeCode),
        eq(lookups.isDeleted, false)
      ))
      .limit(1);

    if (!postTypeLookup) {
      // Get available post types for better error message
      const availablePostTypes = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, LookupTypeCode.POST_TYPE),
          eq(lookups.isDeleted, false)
        ));

      const availableCodes = availablePostTypes.map(l => l.code).join(', ');
      
      this.logger.warn(
        `Invalid post type "${postTypeCode}" requested. Available types: ${availableCodes || 'none (seeder not run)'}`
      );

      throw new BadRequestException(
        `Invalid post type: "${postTypeCode}". ` +
        (availableCodes 
          ? `Available types are: ${availableCodes}.`
          : 'No post types found in database. Please run the database seeder to initialize lookup data.')
      );
    }

    // Check if visibility lookup type exists
    const [visibilityLookupType] = await this.db
      .select({ id: lookupTypes.id, code: lookupTypes.code })
      .from(lookupTypes)
      .where(eq(lookupTypes.code, LookupTypeCode.POST_VISIBILITY))
      .limit(1);

    if (!visibilityLookupType) {
      this.logger.error('Lookup type "post_visibility" not found in database. Please run the database seeder.');
      throw new BadRequestException(
        'Post visibility lookup configuration is missing. Please contact the administrator or run the database seeder.'
      );
    }

    // Get visibility lookup - must filter by lookup type
    const [visibilityLookup] = await this.db
      .select({ id: lookups.id, code: lookups.code })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, LookupTypeCode.POST_VISIBILITY),
        eq(lookups.code, visibilityCode),
        eq(lookups.isDeleted, false)
      ))
      .limit(1);

    if (!visibilityLookup) {
      // Get available visibility types for better error message
      const availableVisibilityTypes = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, LookupTypeCode.POST_VISIBILITY),
          eq(lookups.isDeleted, false)
        ));

      const availableCodes = availableVisibilityTypes.map(l => l.code).join(', ');
      
      this.logger.warn(
        `Invalid visibility "${visibilityCode}" requested. Available types: ${availableCodes || 'none (seeder not run)'}`
      );

      throw new BadRequestException(
        `Invalid visibility: "${visibilityCode}". ` +
        (availableCodes 
          ? `Available types are: ${availableCodes}.`
          : 'No visibility types found in database. Please run the database seeder to initialize lookup data.')
      );
    }

    // Map DTO to database schema
    interface PostInsertData {
      content: string;
      postTypeId: number;
      visibilityId: number;
      userId: number;
      groupId?: number;
      pageId?: number;
      mentionIds?: number[];
    }
    
    const postData: PostInsertData = {
      content: dto.content,
      postTypeId: postTypeLookup.id,
      visibilityId: visibilityLookup.id,
      userId: dto.userId, // Added by controller
    };

    // Validate and add groupId if group_id is provided
    if (dto.group_id) {
      const [groupExists] = await this.db
        .select({ id: groups.id })
        .from(groups)
        .where(and(
          eq(groups.id, dto.group_id),
          eq(groups.isDeleted, false)
        ))
        .limit(1);

      if (!groupExists) {
        this.logger.warn(`Group with id ${dto.group_id} not found or is deleted`);
        throw new BadRequestException(`Group with id ${dto.group_id} not found or is deleted`);
      }

      postData.groupId = dto.group_id;
    }

    // Validate and add pageId if page_id is provided
    if (dto.page_id) {
      const [pageExists] = await this.db
        .select({ id: pages.id })
        .from(pages)
        .where(and(
          eq(pages.id, dto.page_id),
          eq(pages.isDeleted, false)
        ))
        .limit(1);

      if (!pageExists) {
        this.logger.warn(`Page with id ${dto.page_id} not found or is deleted`);
        throw new BadRequestException(`Page with id ${dto.page_id} not found or is deleted`);
      }

      postData.pageId = dto.page_id;
    }

    // Add mentionIds if provided
    if (dto.mentionIds && dto.mentionIds.length > 0) {
      postData.mentionIds = dto.mentionIds;
    }

    const [post] = await this.db.insert(posts).values(postData as InferInsertModel<typeof posts>).returning();
    
    // Handle file uploads and linking
    const fileIdsToLink: number[] = [];
    
    // 1. Upload new files if provided
    if (dto.files && dto.files.length > 0) {
      // Get media provider lookup (codes: 'minio', 'r2', 's3', 'local')
      const providerCode = this.storageProvider === 'r2' ? MediaProviderCode.R2 : MediaProviderCode.MINIO;
      const [mediaProviderLookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, LookupTypeCode.MEDIA_PROVIDER),
          eq(lookups.code, providerCode),
          eq(lookups.isDeleted, false)
        ))
        .limit(1);

      let providerId: number;
      if (!mediaProviderLookup) {
        this.logger.warn(`Media provider lookup not found for "${providerCode}", trying to get any provider`);
        // Try to get any media provider as fallback
        const [anyProvider] = await this.db
          .select({ id: lookups.id })
          .from(lookups)
          .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
          .where(and(
            eq(lookupTypes.code, LookupTypeCode.MEDIA_PROVIDER),
            eq(lookups.isDeleted, false)
          ))
          .limit(1);
        
        if (!anyProvider) {
          throw new BadRequestException(
            'Media provider lookup not configured. Please run the database seeder to initialize lookup data.'
          );
        }
        
        providerId = anyProvider.id;
      } else {
        providerId = mediaProviderLookup.id;
      }

      // Upload each file and save to media_library
      for (const file of dto.files) {
        try {
          // Upload file to storage
          const uploadResult = this.storageProvider === 'r2'
            ? await this.r2Service.uploadFile(file, 'posts')
            : await this.minioService.uploadFile(file, 'posts');

          // Determine file type
          const fileType = file.mimetype.startsWith('image/') ? 'image'
            : file.mimetype.startsWith('video/') ? 'video'
            : file.mimetype.startsWith('audio/') ? 'audio'
            : 'document';

          // Save to media_library
          const [mediaRecord] = await this.db
            .insert(mediaLibrary)
            .values({
              uploadedBy: dto.userId,
              mediableType: 'post',
              mediableId: post.id,
              providerId,
              fileName: uploadResult.key.split('/').pop() || file.originalname,
              originalName: file.originalname,
              filePath: uploadResult.url,
              fileType,
              mimeType: file.mimetype,
              fileSize: file.size,
              isTemporary: false,
              isDeleted: false,
            } as InferInsertModel<typeof mediaLibrary>)
            .returning();

          fileIdsToLink.push(mediaRecord.id);
          this.logger.log(`File uploaded and linked to post ${post.id}: ${file.originalname}`);
        } catch (error) {
          this.logger.error(`Failed to upload file ${file.originalname}:`, error);
          // Continue with other files even if one fails
        }
      }
    }

    // 2. Link existing files by fileIds
    if (dto.fileIds && dto.fileIds.length > 0) {
      // Verify files exist and update them to link to this post
      const existingFiles = await this.db
        .select()
        .from(mediaLibrary)
        .where(
          and(
            inArray(mediaLibrary.id, dto.fileIds),
            eq(mediaLibrary.isDeleted, false)
          )
        );

      if (existingFiles.length !== dto.fileIds.length) {
        const foundIds = existingFiles.map(f => f.id);
        const missingIds = dto.fileIds.filter(id => !foundIds.includes(id));
        this.logger.warn(`Some file IDs not found: ${missingIds.join(', ')}`);
      }

      // Update files to link to this post
      if (existingFiles.length > 0) {
        await this.db
          .update(mediaLibrary)
          .set({
            mediableType: 'post',
            mediableId: post.id,
            isTemporary: false, // Mark as permanent since it's linked to a post
          } as Partial<InferInsertModel<typeof mediaLibrary>>)
          .where(
            and(
              inArray(mediaLibrary.id, existingFiles.map(f => f.id)),
              eq(mediaLibrary.isDeleted, false)
            )
          );

        fileIdsToLink.push(...existingFiles.map(f => f.id));
        this.logger.log(`Linked ${existingFiles.length} existing files to post ${post.id}`);
      }
    }
    
    // Notify mentioned users
    if (dto.mentionIds && dto.mentionIds.length > 0) {
      await this.notifyMentionedUsers(dto.mentionIds, post.id, dto.userId);
    }
    
    // Return post with file information
    const linkedFiles = fileIdsToLink.length > 0
      ? await this.db
          .select()
          .from(mediaLibrary)
          .where(
            and(
              inArray(mediaLibrary.id, fileIdsToLink),
              eq(mediaLibrary.isDeleted, false)
            )
          )
      : [];

    return {
      ...post,
      files: linkedFiles,
    };
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

  async findByUser(userId: number, query?: any) {
    const { page = 1, limit = 100, search } = query || {};
    const offset = (page - 1) * limit;
    const conditions = [eq(posts.userId, userId), eq(posts.isDeleted, false)];

    if (search) {
      conditions.push(like(posts.content, `%${search}%`));
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

  async findOne(id: number) {
    const [post] = await this.db.select().from(posts).where(and(eq(posts.id, id), eq(posts.isDeleted, false))).limit(1);
    if (!post) throw new Error('Post not found');
    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId?: number) {
    await this.findOne(id);
    const updateData: Partial<InferSelectModel<typeof posts>> = {};
    
    if (dto.content !== undefined) updateData.content = dto.content;
    
    if (dto.post_type !== undefined) {
      const [postTypeLookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, LookupTypeCode.POST_TYPE),
          eq(lookups.code, dto.post_type),
          eq(lookups.isDeleted, false)
        ))
        .limit(1);
      
      if (!postTypeLookup) {
        const availablePostTypes = await this.db
          .select({ code: lookups.code })
          .from(lookups)
          .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
          .where(and(
            eq(lookupTypes.code, LookupTypeCode.POST_TYPE),
            eq(lookups.isDeleted, false)
          ));

        const availableCodes = availablePostTypes.map(l => l.code).join(', ');
        throw new BadRequestException(
          `Invalid post type: "${dto.post_type}". ` +
          (availableCodes 
            ? `Available types are: ${availableCodes}.`
            : 'No post types found. Please run the database seeder.')
        );
      }
      
      updateData.postTypeId = postTypeLookup.id;
    }
    
    if (dto.visibility !== undefined) {
      const [visibilityLookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, LookupTypeCode.POST_VISIBILITY),
          eq(lookups.code, dto.visibility),
          eq(lookups.isDeleted, false)
        ))
        .limit(1);
      
      if (!visibilityLookup) {
        const availableVisibilityTypes = await this.db
          .select({ code: lookups.code })
          .from(lookups)
          .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
          .where(and(
            eq(lookupTypes.code, LookupTypeCode.POST_VISIBILITY),
            eq(lookups.isDeleted, false)
          ));

        const availableCodes = availableVisibilityTypes.map(l => l.code).join(', ');
        throw new BadRequestException(
          `Invalid visibility: "${dto.visibility}". ` +
          (availableCodes 
            ? `Available types are: ${availableCodes}.`
            : 'No visibility types found. Please run the database seeder.')
        );
      }
      
      updateData.visibilityId = visibilityLookup.id;
    }
    
    // Validate and update groupId if group_id is provided
    if (dto.group_id !== undefined) {
      if (dto.group_id === null) {
        // Allow setting to null
        updateData.groupId = null;
      } else {
        // Validate group exists
        const [groupExists] = await this.db
          .select({ id: groups.id })
          .from(groups)
          .where(and(
            eq(groups.id, dto.group_id),
            eq(groups.isDeleted, false)
          ))
          .limit(1);

        if (!groupExists) {
          this.logger.warn(`Group with id ${dto.group_id} not found or is deleted`);
          throw new BadRequestException(`Group with id ${dto.group_id} not found or is deleted`);
        }

        updateData.groupId = dto.group_id;
      }
    }

    // Validate and update pageId if page_id is provided
    if (dto.page_id !== undefined) {
      if (dto.page_id === null) {
        // Allow setting to null
        updateData.pageId = null;
      } else {
        // Validate page exists
        const [pageExists] = await this.db
          .select({ id: pages.id })
          .from(pages)
          .where(and(
            eq(pages.id, dto.page_id),
            eq(pages.isDeleted, false)
          ))
          .limit(1);

        if (!pageExists) {
          this.logger.warn(`Page with id ${dto.page_id} not found or is deleted`);
          throw new BadRequestException(`Page with id ${dto.page_id} not found or is deleted`);
        }

        updateData.pageId = dto.page_id;
      }
    }
    
    const [updated] = await this.db.update(posts).set(updateData as Partial<InferInsertModel<typeof posts>>).where(eq(posts.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(posts)      
    .set({ 
        isDeleted: true, 
        deletedAt: new Date() 
      } as Partial<InferInsertModel<typeof posts>>)
    .where(eq(posts.id, id));
  }

  async findAllAdmin(query: any) {
    try {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      
      this.logger.error(`Error fetching posts: ${errorMessage}`, errorStack);
      if (errorCode === 'ECONNREFUSED' || (typeof errorMessage === 'string' && errorMessage.includes('ECONNREFUSED'))) {
        throw new Error('Database connection failed. Please check if the database is running.');
      }
      throw error;
    }
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
          eq(lookupTypes.code, LookupTypeCode.REACTION_TYPE),
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
        } as InferInsertModel<typeof postReactions>);
        
        // Increment count
        await this.db
          .update(posts)
          .set({ reactionCount: sql`${posts.reactionCount} + 1` } as Partial<InferInsertModel<typeof posts>>)
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
                  postUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/posts/${postId}`,
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
      .set({ isHidden: true } )
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async unhidePost(id: number) {
    const [updated] = await this.db
      .update(posts)
      .set({ isHidden: false } as Partial<InferInsertModel<typeof posts>>)
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async bulkOperation(dto: BulkPostOperationDto) {
    const { action, ids } = dto;
    
    switch (action) {
      case 'delete':
        await this.db
          .update(posts)
          .set({ isDeleted: true, deletedAt: new Date() })
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} posts` };
      
      case 'hide':
        await this.db
          .update(posts)
          .set({ isHidden: true })
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Hidden ${ids.length} posts` };
      
      case 'unhide':
        await this.db
          .update(posts)
          .set({ isHidden: false })
          .where(sql`${posts.id} = ANY(${ids})`);
        return { message: `Unhidden ${ids.length} posts` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: { search?: string }) {
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

  private async notifyMentionedUsers(
    mentionIds: number[],
    postId: number,
    mentionerId: number
  ) {
    try {
      // Get mentioned users
      const mentionedUsers = await this.db
        .select()
        .from(users)
        .where(inArray(users.id, mentionIds));
      
      if (mentionedUsers.length === 0) {
        return;
      }

      // Get post author info
      const [postAuthor] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, mentionerId))
        .limit(1);

      if (!postAuthor) {
        this.logger.warn(`Post author ${mentionerId} not found`);
        return;
      }

      const authorName = `${postAuthor.firstName || ''} ${postAuthor.lastName || ''}`.trim() || postAuthor.username;

      // Get post content preview (first 100 chars)
      const [post] = await this.db
        .select({ content: posts.content })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      const postPreview = post?.content ? post.content.substring(0, 100) : '';

      // Get mention notification type
      const [mentionNotifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'mention_in_post')
        ))
        .limit(1);

      if (!mentionNotifType) {
        this.logger.warn('Mention in post notification type not found');
        return;
      }
      
      // Send notification to each mentioned user
      for (const user of mentionedUsers) {
        if (user.id !== mentionerId) {
          await this.notificationsService.sendMultiChannelNotification({
            userId: user.id,
            notificationTypeId: mentionNotifType.id,
            title: 'You were mentioned',
            message: `${authorName} mentioned you in a post`,
            linkUrl: `/posts/${postId}`,
            channels: ['database', 'websocket', 'fcm', 'email'],
            emailData: {
              templateMethod: 'sendMentionInPostEmail',
              data: {
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                mentionedByName: authorName,
                postPreview,
                postUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/posts/${postId}`,
              }
            }
          });
          
          this.logger.log(`Mention notification sent to user ${user.id}`);
        }
      }
    } catch (error) {
      this.logger.error('Error notifying mentioned users:', error);
    }
  }
}
