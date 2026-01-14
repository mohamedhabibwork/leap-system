import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { comments, posts, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    try {
      // 1. Create comment
      const [comment] = await this.db.insert(comments).values({
        ...createCommentDto,
        userId: userId,
      } as any).returning();
      
      // 2. Update comment count on post/entity
      if (createCommentDto.commentableType === 'post') {
        await this.db
          .update(posts)
          .set({ commentCount: sql`${posts.commentCount} + 1` })
          .where(eq(posts.id, createCommentDto.commentableId));
      }
      
      // 3. Get commenter info
      const [commenter] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!commenter) {
        this.logger.warn(`Commenter user ${userId} not found`);
        return comment;
      }

      const commenterName = `${commenter.firstName || ''} ${commenter.lastName || ''}`.trim() || commenter.username;
      
      // 4. Check if this is a reply to another comment
      if (createCommentDto.parentCommentId) {
        // Notify parent comment author
        const [parentComment] = await this.db
          .select()
          .from(comments)
          .where(eq(comments.id, createCommentDto.parentCommentId))
          .limit(1);
        
        if (parentComment && parentComment.userId !== userId) {
          const [replyNotifType] = await this.db
            .select({ id: lookups.id })
            .from(lookups)
            .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
            .where(and(
              eq(lookupTypes.code, 'notification_type'),
              eq(lookups.code, 'comment_reply')
            ))
            .limit(1);

          if (replyNotifType) {
            await this.notificationsService.sendMultiChannelNotification({
              userId: parentComment.userId,
              notificationTypeId: replyNotifType.id,
              title: 'New Reply',
              message: `${commenterName} replied to your comment`,
              linkUrl: `/posts/${createCommentDto.commentableId}#comment-${comment.id}`,
              channels: ['database', 'websocket', 'fcm', 'email'],
              emailData: {
                templateMethod: 'sendCommentReplyEmail',
                data: {
                  userName: 'User',
                  replierName: commenterName,
                  commentText: comment.content.substring(0, 100),
                  postUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/posts/${createCommentDto.commentableId}#comment-${comment.id}`,
                }
              }
            });
            
            this.logger.log(`Reply notification sent to user ${parentComment.userId}`);
          }
        }
      } else {
        // Notify post/entity owner
        if (createCommentDto.commentableType === 'post') {
          const [post] = await this.db
            .select()
            .from(posts)
            .where(eq(posts.id, createCommentDto.commentableId))
            .limit(1);
          
          if (post && post.userId !== userId) {
            const [commentNotifType] = await this.db
              .select({ id: lookups.id })
              .from(lookups)
              .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
              .where(and(
                eq(lookupTypes.code, 'notification_type'),
                eq(lookups.code, 'post_comment')
              ))
              .limit(1);

            if (commentNotifType) {
              await this.notificationsService.sendMultiChannelNotification({
                userId: post.userId,
                notificationTypeId: commentNotifType.id,
                title: 'New Comment',
                message: `${commenterName} commented on your post`,
                linkUrl: `/posts/${post.id}#comment-${comment.id}`,
                channels: ['database', 'websocket', 'fcm', 'email'],
                emailData: {
                  templateMethod: 'sendPostCommentEmail',
                  data: {
                    userName: 'User',
                    commenterName,
                    commentText: comment.content.substring(0, 100),
                    postUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/posts/${post.id}#comment-${comment.id}`,
                  }
                }
              });
              
              this.logger.log(`Comment notification sent to post owner ${post.userId}`);
            }
          }
        }
      }
      
      // 5. Check for @mentions in comment content
      const mentions = this.extractMentions(comment.content);
      if (mentions.length > 0) {
        await this.notifyMentionedUsers(mentions, comment.id, createCommentDto.commentableId, userId, commenterName);
      }
      
      return comment;
    } catch (error) {
      this.logger.error('Error creating comment:', error);
      throw error;
    }
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  }

  private async notifyMentionedUsers(
    usernames: string[], 
    commentId: number, 
    postId: number, 
    mentionerId: number,
    commenterName: string
  ) {
    try {
      // Get user IDs from usernames
      const mentionedUsers = await this.db
        .select()
        .from(users)
        .where(inArray(users.username, usernames));
      
      // Get mention notification type
      const [mentionNotifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'mention')
        ))
        .limit(1);

      if (!mentionNotifType) {
        this.logger.warn('Mention notification type not found');
        return;
      }
      
      // Send notification to each mentioned user
      for (const user of mentionedUsers) {
        if (user.id !== mentionerId) {
          await this.notificationsService.sendMultiChannelNotification({
            userId: user.id,
            notificationTypeId: mentionNotifType.id,
            title: 'You were mentioned',
            message: `${commenterName} mentioned you in a comment`,
            linkUrl: `/posts/${postId}#comment-${commentId}`,
            channels: ['database', 'websocket', 'fcm', 'email'],
            emailData: {
              templateMethod: 'sendMentionEmail',
              data: {
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                mentionerName: commenterName,
                postUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/posts/${postId}#comment-${commentId}`,
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

  async findByCommentable(type: string, id: number) {
    return await this.db.select().from(comments).where(
      and(
        eq(comments.commentableType, type),
        eq(comments.commentableId, id),
        eq(comments.isDeleted, false)
      )
    );
  }

  async findOne(id: number) {
    const [comment] = await this.db.select().from(comments).where(
      and(eq(comments.id, id), eq(comments.isDeleted, false))
    ).limit(1);
    if (!comment) throw new NotFoundException(`Comment with ID ${id} not found`);
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(comments).set({
      ...updateCommentDto,
    }).where(eq(comments.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(comments).set({
      isDeleted: true,
    } as any).where(eq(comments.id, id));
  }
}
