import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionsAPI, Thread, CreateThreadDto, ReplyDto, PaginationDto } from '@/lib/api/discussions';

/**
 * Hook to fetch course discussion threads
 */
export function useCourseThreads(
  courseId: number,
  options?: PaginationDto & { enabled?: boolean }
) {
  return useQuery<Thread[]>({
    queryKey: ['course-threads', courseId, options?.sortBy, options?.page, options?.limit],
    queryFn: () =>
      discussionsAPI.getCourseThreads(courseId, {
        sortBy: options?.sortBy,
        page: options?.page,
        limit: options?.limit,
      }),
    enabled: !!courseId && (options?.enabled !== false),
  });
}

/**
 * Hook to fetch lesson discussion threads
 */
export function useLessonThreads(
  lessonId: number,
  options?: PaginationDto & { enabled?: boolean }
) {
  return useQuery<Thread[]>({
    queryKey: ['lesson-threads', lessonId, options?.sortBy, options?.page, options?.limit],
    queryFn: () =>
      discussionsAPI.getLessonThreads(lessonId, {
        sortBy: options?.sortBy,
        page: options?.page,
        limit: options?.limit,
      }),
    enabled: !!lessonId && (options?.enabled !== false),
  });
}

/**
 * Hook to create a new discussion thread
 */
export function useCreateThread(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation<Thread, Error, CreateThreadDto>({
    mutationFn: (data: CreateThreadDto) =>
      discussionsAPI.createThread(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-threads'] });
    },
  });
}

/**
 * Hook to reply to a discussion thread
 */
export function useReplyToThread(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation<
    { id: number; content: string; threadId: number },
    Error,
    { threadId: number; content: string }
  >({
    mutationFn: (data: { threadId: number; content: string }) =>
      discussionsAPI.replyToThread(data.threadId, { content: data.content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-threads'] });
      queryClient.invalidateQueries({ queryKey: ['thread', variables.threadId] });
    },
  });
}

/**
 * Hook to upvote a discussion thread
 */
export function useUpvoteThread(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (threadId: number) => discussionsAPI.upvoteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-threads'] });
    },
  });
}

/**
 * Hook to upvote a reply
 */
export function useUpvoteReply(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (replyId: number) => discussionsAPI.upvoteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-threads'] });
    },
  });
}

/**
 * Hook to mark a reply as solution
 */
export function useMarkSolution(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { threadId: number; replyId: number }>({
    mutationFn: ({ threadId, replyId }) =>
      discussionsAPI.markSolution(threadId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-threads'] });
    },
  });
}
