import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, desc, isNull, sql, count } from 'drizzle-orm';
import { comments, commentReactions, users, courses, lessons, courseSections } from '@leap-lms/database';

export interface CreateThreadDto {
  title: string;
  content: string;
  lessonId?: number;
  sectionId?: number;
}

export interface ReplyDto {
  content: string;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'unanswered';
}

export interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
  courseId: number;
  lessonId?: number;
  sectionId?: number;
  likesCount: number;
  repliesCount: number;
  hasSolution: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface Reply {
  id: number;
  content: string;
  userId: number;
  threadId: number;
  parentCommentId?: number;
  isSolution: boolean;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class DiscussionsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new discussion thread
   */
  async createThread(
    courseId: number,
    userId: number,
    data: CreateThreadDto,
  ): Promise<Thread> {
    // Verify course exists
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // If lessonId is provided, verify it belongs to the course
    if (data.lessonId) {
      const [lesson] = await this.db
        .select()
        .from(lessons)
        .innerJoin(courseSections, eq(courseSections.id, lessons.sectionId))
        .where(
          and(
            eq(lessons.id, data.lessonId),
            eq(courseSections.courseId, courseId),
            eq(lessons.isDeleted, false),
          ),
        )
        .limit(1);

      if (!lesson) {
        throw new BadRequestException('Lesson does not belong to this course');
      }
    }

    // Create thread as a comment with commentableType='course' or 'lesson'
    const commentableType = data.lessonId ? 'lesson' : 'course';
    const commentableId = data.lessonId || courseId;

    const [thread] = await this.db
      .insert(comments)
      .values({
        userId,
        commentableType,
        commentableId,
        content: `${data.title}\n\n${data.content}`, // Store title in content for now
        likesCount: 0,
      } as any)
      .returning();

    return this.getThreadById(thread.id);
  }

  /**
   * Reply to a thread
   */
  async replyToThread(
    threadId: number,
    userId: number,
    data: ReplyDto,
  ): Promise<Reply> {
    // Verify thread exists
    const [thread] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, threadId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Create reply
    const [reply] = await this.db
      .insert(comments)
      .values({
        userId,
        commentableType: thread.commentableType,
        commentableId: thread.commentableId,
        parentCommentId: threadId,
        content: data.content,
        likesCount: 0,
      } as any)
      .returning();

    return this.getReplyById(reply.id);
  }

  /**
   * Get course threads
   */
  async getCourseThreads(
    courseId: number,
    query: PaginationDto = {},
  ): Promise<Thread[]> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Get threads (comments with commentableType='course' and no parent)
    const baseQuery = this.db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        repliesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${comments} AS replies
          WHERE replies.parent_comment_id = ${comments.id}
          AND replies.isDeleted = false
        )`,
      })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'course'),
          eq(comments.commentableId, courseId),
          isNull(comments.parentCommentId),
          eq(comments.isDeleted, false),
        ),
      );

    // Apply sorting
    let threadsQuery;
    if (query.sortBy === 'popular') {
      threadsQuery = baseQuery.orderBy(desc(comments.likesCount), desc(comments.createdAt));
    } else if (query.sortBy === 'unanswered') {
      threadsQuery = baseQuery.orderBy(
        sql`(SELECT COUNT(*) FROM ${comments} AS replies WHERE replies.parent_comment_id = ${comments.id} AND replies.isDeleted = false)`,
        desc(comments.createdAt),
      );
    } else {
      threadsQuery = baseQuery.orderBy(desc(comments.createdAt));
    }

    const threads = await threadsQuery.limit(limit).offset(offset);

    // Get user details and format threads
    const formattedThreads = await Promise.all(
      threads.map(async (thread) => {
        const [user] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, thread.userId))
          .limit(1);

        // Check if thread has a solution (reply marked as solution)
        const [solution] = await this.db
          .select()
          .from(comments)
          .where(
            and(
              eq(comments.parentCommentId, thread.id),
              eq(comments.isDeleted, false),
            ),
          )
          .limit(1);

        // Extract title from content (first line)
        const contentLines = (thread.content as string).split('\n');
        const title = contentLines[0] || '';
        const content = contentLines.slice(1).join('\n').trim();

        return {
          id: thread.id,
          title,
          content,
          userId: thread.userId,
          courseId,
          likesCount: thread.likesCount || 0,
          repliesCount: Number(thread.repliesCount || 0),
          hasSolution: !!solution,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          user: user || { id: thread.userId },
        };
      }),
    );

    return formattedThreads;
  }

  /**
   * Get lesson threads
   */
  async getLessonThreads(
    lessonId: number,
    query: PaginationDto = {},
  ): Promise<Thread[]> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const threads = await this.db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        repliesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${comments} AS replies
          WHERE replies.parent_comment_id = ${comments.id}
          AND replies.isDeleted = false
        )`,
      })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, 'lesson'),
          eq(comments.commentableId, lessonId),
          isNull(comments.parentCommentId),
          eq(comments.isDeleted, false),
        ),
      )
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    const formattedThreads = await Promise.all(
      threads.map(async (thread) => {
        const [user] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, thread.userId))
          .limit(1);

        const contentLines = (thread.content as string).split('\n');
        const title = contentLines[0] || '';
        const content = contentLines.slice(1).join('\n').trim();

        return {
          id: thread.id,
          title,
          content,
          userId: thread.userId,
          courseId: 0, // Will be set by caller if needed
          lessonId,
          likesCount: thread.likesCount || 0,
          repliesCount: Number(thread.repliesCount || 0),
          hasSolution: false,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          user: user || { id: thread.userId },
        };
      }),
    );

    return formattedThreads;
  }

  /**
   * Mark a reply as solution
   */
  async markSolution(threadId: number, replyId: number): Promise<void> {
    // Verify thread exists
    const [thread] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, threadId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Verify reply exists and belongs to thread
    const [reply] = await this.db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.id, replyId),
          eq(comments.parentCommentId, threadId),
          eq(comments.isDeleted, false),
        ),
      )
      .limit(1);

    if (!reply) {
      throw new NotFoundException('Reply not found or does not belong to this thread');
    }

    // Mark reply as solution by updating its content to include a solution marker
    // In a production system, you might want a dedicated isSolution field
    // For now, we'll prepend a marker to the content
    const solutionMarker = '[SOLUTION]';
    if (!reply.content?.toString().startsWith(solutionMarker)) {
      await this.db
        .update(comments)
        .set({
          content: `${solutionMarker} ${reply.content}`,
          updatedAt: new Date(),
        } as any)
        .where(eq(comments.id, replyId));
    }
  }

  /**
   * Upvote a thread
   */
  async upvoteThread(threadId: number, userId: number): Promise<void> {
    const [thread] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, threadId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Check if user already upvoted
    const [existingReaction] = await this.db
      .select()
      .from(commentReactions)
      .where(
        and(
          eq(commentReactions.commentId, threadId),
          eq(commentReactions.userId, userId),
          eq(commentReactions.isDeleted, false),
        ),
      )
      .limit(1);

    if (existingReaction) {
      // Remove upvote
      await this.db
        .update(commentReactions)
        .set({ isDeleted: true, deletedAt: new Date() } as any)
        .where(eq(commentReactions.id, existingReaction.id));

      // Decrement likes count
      await this.db
        .update(comments)
        .set({
          likesCount: Math.max(0, (thread.likesCount || 0) - 1),
        } as any)
        .where(eq(comments.id, threadId));
    } else {
      // Add upvote
      await this.db.insert(commentReactions).values({
        commentId: threadId,
        userId,
        reactionTypeId: 1, // Assuming 1 is 'like' in lookups
      } as any);

      // Increment likes count
      await this.db
        .update(comments)
        .set({
          likesCount: (thread.likesCount || 0) + 1,
        } as any)
        .where(eq(comments.id, threadId));
    }
  }

  /**
   * Upvote a reply
   */
  async upvoteReply(replyId: number, userId: number): Promise<void> {
    const [reply] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, replyId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Check if user already upvoted
    const [existingReaction] = await this.db
      .select()
      .from(commentReactions)
      .where(
        and(
          eq(commentReactions.commentId, replyId),
          eq(commentReactions.userId, userId),
          eq(commentReactions.isDeleted, false),
        ),
      )
      .limit(1);

    if (existingReaction) {
      // Remove upvote
      await this.db
        .update(commentReactions)
        .set({ isDeleted: true, deletedAt: new Date() } as any)
        .where(eq(commentReactions.id, existingReaction.id));

      await this.db
        .update(comments)
        .set({
          likesCount: Math.max(0, (reply.likesCount || 0) - 1),
        } as any)
        .where(eq(comments.id, replyId));
    } else {
      // Add upvote
      await this.db.insert(commentReactions).values({
        commentId: replyId,
        userId,
        reactionTypeId: 1,
      } as any);

      await this.db
        .update(comments)
        .set({
          likesCount: (reply.likesCount || 0) + 1,
        } as any)
        .where(eq(comments.id, replyId));
    }
  }

  /**
   * Get thread by ID
   */
  private async getThreadById(threadId: number): Promise<Thread> {
    const [thread] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, threadId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const [user] = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, thread.userId))
      .limit(1);

    const contentLines = (thread.content as string).split('\n');
    const title = contentLines[0] || '';
    const content = contentLines.slice(1).join('\n').trim();

    return {
      id: thread.id,
      title,
      content,
      userId: thread.userId,
      courseId: thread.commentableType === 'course' ? thread.commentableId : 0,
      lessonId: thread.commentableType === 'lesson' ? thread.commentableId : undefined,
      likesCount: thread.likesCount || 0,
      repliesCount: 0,
      hasSolution: false,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      user: user || { id: thread.userId },
    };
  }

  /**
   * Get reply by ID
   */
  private async getReplyById(replyId: number): Promise<Reply> {
    const [reply] = await this.db
      .select()
      .from(comments)
      .where(and(eq(comments.id, replyId), eq(comments.isDeleted, false)))
      .limit(1);

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    const [user] = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, reply.userId))
      .limit(1);

    return {
      id: reply.id,
      content: reply.content as string,
      userId: reply.userId,
      threadId: reply.parentCommentId || 0,
      parentCommentId: reply.parentCommentId,
      isSolution: false,
      likesCount: reply.likesCount || 0,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      user: user || { id: reply.userId },
    };
  }
}
