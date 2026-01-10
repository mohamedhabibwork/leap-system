import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// Courses
export function useCourses(params?: any) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => apiClient.get<any[]>('/lms/courses', { params }),
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
    getNextPageParam: (lastPage: any) => {
      // API returns { data: [...], pagination: { page, totalPages, ... } }
      const pagination = lastPage?.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined; // No more pages
      }
      return pagination.page + 1; // Return next page number
    },
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
    queryFn: () => apiClient.get<any[]>(`/comments?entityType=${entityType}&entityId=${entityId}`),
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
    queryFn: () => apiClient.get<any[]>(`/notes?entityType=${entityType}&entityId=${entityId}`),
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
    queryFn: () => apiClient.get<any[]>('/social/groups'),
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
      return await apiClient.get<any>(`/lms/lessons/${lessonId}`);
    },
    enabled: !!lessonId,
  });
}

export function useLessonAccess(lessonId: number) {
  return useQuery({
    queryKey: ['lessons', lessonId, 'access'],
    queryFn: async () => {
      return await apiClient.get<any>(`/lms/lessons/${lessonId}/access-check`);
    },
    enabled: !!lessonId,
  });
}

export function useCourseLessons(courseId: number) {
  return useQuery({
    queryKey: ['courses', courseId, 'lessons'],
    queryFn: async () => {
      return await apiClient.get<any[]>(`/lms/lessons/course/${courseId}`);
    },
    enabled: !!courseId,
  });
}

// Enrollment with type info
export function useEnrollmentWithType(courseId: number) {
  return useQuery({
    queryKey: ['enrollments', courseId, 'with-type'],
    queryFn: async () => {
      return await apiClient.get<any>(`/lms/enrollments/course/${courseId}`);
    },
    enabled: !!courseId,
  });
}

// Ads hooks
export function useAds(params?: any) {
  return useQuery({
    queryKey: ['ads', params],
    queryFn: () => apiClient.get('/ads', { params }),
  });
}

export function useAdStatistics() {
  return useQuery({
    queryKey: ['ads', 'statistics'],
    queryFn: () => apiClient.get('/ads/statistics'),
  });
}

export function usePauseAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/ads/${id}/pause`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useResumeAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/ads/${id}/resume`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/ads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
}

export function useAdAnalytics(id: number) {
  return useQuery({
    queryKey: ['ads', id, 'analytics'],
    queryFn: () => apiClient.get(`/ads/${id}/analytics`),
    enabled: !!id,
  });
}

// Admin ads hooks
export function useAdminAds(params?: any) {
  return useQuery({
    queryKey: ['admin', 'ads', params],
    queryFn: () => apiClient.get('/admin/ads', { params }),
  });
}

export function usePendingAds(params?: any) {
  return useQuery({
    queryKey: ['admin', 'ads', 'pending', params],
    queryFn: () => apiClient.get('/admin/ads/pending', { params }),
  });
}

export function useAdminAdStatistics() {
  return useQuery({
    queryKey: ['admin', 'ads', 'statistics'],
    queryFn: () => apiClient.get('/admin/ads/statistics'),
  });
}

export function useApproveAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`/admin/ads/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
    },
  });
}

export function useRejectAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      apiClient.post(`/admin/ads/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
    },
  });
}

// Groups hooks
export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => apiClient.get(`/social/groups/${id}`),
    enabled: !!id,
  });
}

export function useGroupMembers(id: number, params?: any) {
  return useQuery({
    queryKey: ['groups', id, 'members', params],
    queryFn: () => apiClient.get(`/social/groups/${id}/members`, { params }),
    enabled: !!id,
  });
}

// Profile Management
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/users/profile'),
  });
}

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => apiClient.get(`/users/${userId}/profile`),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.patch('/users/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Activity Feed
export function useActivityFeed(params?: any) {
  return useQuery({
    queryKey: ['activity-feed', params],
    queryFn: () => apiClient.get('/users/activity-feed', { params }),
  });
}

export function useUserActivity(userId: number, params?: any) {
  return useQuery({
    queryKey: ['users', userId, 'activity', params],
    queryFn: () => apiClient.get(`/users/${userId}/activity`, { params }),
    enabled: !!userId,
  });
}

// Recommendations
export function useRecommendations(type?: 'courses' | 'users' | 'groups' | 'events') {
  return useQuery({
    queryKey: ['recommendations', type],
    queryFn: () => apiClient.get('/recommendations', { params: { type } }),
  });
}

export function useCourseRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'courses'],
    queryFn: () => apiClient.get('/recommendations/courses'),
  });
}

export function useConnectionRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'connections'],
    queryFn: () => apiClient.get('/recommendations/connections'),
  });
}

// Global Search
export function useGlobalSearch(query: string, filters?: any) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => apiClient.get('/search', { params: { query, ...filters } }),
    enabled: query.length > 2,
  });
}

export function useSearchCourses(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'courses', query, params],
    queryFn: () => apiClient.get('/search/courses', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

export function useSearchUsers(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'users', query, params],
    queryFn: () => apiClient.get('/search/users', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

export function useSearchGroups(query: string, params?: any) {
  return useQuery({
    queryKey: ['search', 'groups', query, params],
    queryFn: () => apiClient.get('/search/groups', { params: { query, ...params } }),
    enabled: query.length > 2,
  });
}

// Bulk Bookmark Actions
export function useBulkBookmarkActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, itemIds }: { action: 'add' | 'remove'; itemIds: number[] }) =>
      apiClient.post('/favorites/bulk', { action, itemIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Connections/Following
export function useConnections(params?: any) {
  return useQuery({
    queryKey: ['connections', params],
    queryFn: () => apiClient.get('/users/connections', { params }),
  });
}

export function useFollowing() {
  return useQuery({
    queryKey: ['following'],
    queryFn: () => apiClient.get('/users/following'),
  });
}

export function useFollowers() {
  return useQuery({
    queryKey: ['followers'],
    queryFn: () => apiClient.get('/users/followers'),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiClient.post(`/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => apiClient.post(`/users/${userId}/unfollow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

// Reactions (Likes)
export function useReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      apiClient.post('/reactions', { entityType, entityId }),
    onSuccess: (_, { entityType }) => {
      // Invalidate based on entity type
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      apiClient.delete('/reactions', { data: { entityType, entityId } }),
    onSuccess: (_, { entityType }) => {
      if (entityType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (entityType === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}

// Bookmarks
export function useBookmarks(params?: any) {
  return useQuery({
    queryKey: ['bookmarks', params],
    queryFn: () => apiClient.get('/favorites', { params }),
  });
}

// Messages/Chat (if not already covered by socket)
export function useChatRooms() {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => apiClient.get('/chat/rooms'),
  });
}

export function useChatRoom(roomId: string) {
  return useQuery({
    queryKey: ['chat', 'rooms', roomId],
    queryFn: () => apiClient.get(`/chat/rooms/${roomId}`),
    enabled: !!roomId,
  });
}

// Settings & Preferences
export function useUserSettings() {
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: () => apiClient.get('/users/settings'),
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => apiClient.patch('/users/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
    },
  });
}

// Privacy Settings
export function usePrivacySettings() {
  return useQuery({
    queryKey: ['user', 'privacy'],
    queryFn: () => apiClient.get('/users/privacy'),
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => apiClient.patch('/users/privacy', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'privacy'] });
    },
  });
}
