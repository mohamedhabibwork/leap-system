import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// Courses
export function useCourses(params?: any) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => apiClient.get('/lms/courses', { params }),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => apiClient.get(`/lms/courses/${id}`),
    enabled: !!id,
  });
}

// Enrollments
export function useEnrollments() {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => apiClient.get('/lms/enrollments/my-enrollments'),
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/lms/enrollments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

// Posts with infinite scroll
export function useInfinitePosts(params?: any) {
  return useInfiniteQuery({
    queryKey: ['posts', params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get('/social/posts', { params: { ...params, page: pageParam } }),
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/social/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Comments
export function useComments(entityType: string, entityId: number) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => apiClient.get(`/comments?entityType=${entityType}&entityId=${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/comments', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId],
      });
    },
  });
}

// Notes
export function useNotes(entityType: string, entityId: number) {
  return useQuery({
    queryKey: ['notes', entityType, entityId],
    queryFn: () => apiClient.get(`/notes?entityType=${entityType}&entityId=${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications/my-notifications'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Events
export function useEvents(params?: any) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => apiClient.get('/events', { params }),
  });
}

// Jobs
export function useJobs(params?: any) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => apiClient.get('/jobs', { params }),
  });
}

// Groups
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient.get('/social/groups'),
  });
}

// Favorites
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { entityType: string; entityId: number }) =>
      apiClient.post('/favorites', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Shares
export function useCreateShare() {
  return useMutation({
    mutationFn: (data: { entityType: string; entityId: number; shareType: string }) =>
      apiClient.post('/shares', data),
  });
}

// Lessons
export function useLesson(lessonId: number) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/lessons/${lessonId}`);
      return response.data;
    },
    enabled: !!lessonId,
  });
}

export function useLessonAccess(lessonId: number) {
  return useQuery({
    queryKey: ['lessons', lessonId, 'access'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/lessons/${lessonId}/access-check`);
      return response.data;
    },
    enabled: !!lessonId,
  });
}

export function useCourseLessons(courseId: number) {
  return useQuery({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/lessons/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Enrollment with type info
export function useEnrollmentWithType(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId, 'with-type'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/enrollments/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}
