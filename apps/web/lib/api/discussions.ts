import { apiClient } from './client';

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

/**
 * Discussions API Service
 */
export const discussionsAPI = {
  /**
   * Create a new discussion thread in a course
   */
  createThread: (courseId: number, data: CreateThreadDto) =>
    apiClient.post<Thread>(`/lms/discussions/courses/${courseId}`, data),

  /**
   * Reply to a discussion thread
   */
  replyToThread: (threadId: number, data: ReplyDto) =>
    apiClient.post<Reply>(`/lms/discussions/threads/${threadId}/replies`, data),

  /**
   * Get all discussion threads for a course
   */
  getCourseThreads: (courseId: number, query?: PaginationDto) =>
    apiClient.get<Thread[]>(`/lms/discussions/courses/${courseId}`, {
      params: query,
    }),

  /**
   * Get all discussion threads for a lesson
   */
  getLessonThreads: (lessonId: number, query?: PaginationDto) =>
    apiClient.get<Thread[]>(`/lms/discussions/lessons/${lessonId}`, {
      params: query,
    }),

  /**
   * Mark a reply as the solution to a thread
   */
  markSolution: (threadId: number, replyId: number) =>
    apiClient.post(
      `/lms/discussions/threads/${threadId}/solution/${replyId}`,
    ),

  /**
   * Upvote a discussion thread
   */
  upvoteThread: (threadId: number) =>
    apiClient.post(`/lms/discussions/threads/${threadId}/upvote`),

  /**
   * Upvote a reply
   */
  upvoteReply: (replyId: number) =>
    apiClient.post(`/lms/discussions/replies/${replyId}/upvote`),
};
