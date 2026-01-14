import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { createCrudHooks } from './create-crud-hooks';

// Dashboard Statistics
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => apiClient.get('/admin/dashboard/stats'),
  });
}

// User Management
export function useAdminUsers(params?: any) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => apiClient.get('/admin/users', { params }),
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => apiClient.get(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason?: string }) =>
      apiClient.post(`/admin/users/${userId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiClient.post(`/admin/users/${userId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useBulkUserActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, userIds, data }: { action: string; userIds: number[]; data?: any }) =>
      apiClient.post('/admin/users/bulk', { action, userIds, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// Content Moderation
export function useModerationQueue(params?: any) {
  return useQuery({
    queryKey: ['admin', 'moderation', 'queue', params],
    queryFn: () => apiClient.get('/admin/moderation/queue', { params }),
  });
}

export function useModerationItem(id: number) {
  return useQuery({
    queryKey: ['admin', 'moderation', id],
    queryFn: () => apiClient.get(`/admin/moderation/${id}`),
    enabled: !!id,
  });
}

export function useModerateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approve' | 'reject' | 'flag'; reason?: string }) =>
      apiClient.post(`/admin/moderation/${id}/${action}`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
    },
  });
}

export function useBulkModerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action, reason }: { ids: number[]; action: string; reason?: string }) =>
      apiClient.post('/admin/moderation/bulk', { ids, action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
    },
  });
}

// System Analytics
export function useSystemAnalytics(params?: any) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: () => apiClient.get('/admin/analytics', { params }),
  });
}

export function useUserGrowthAnalytics(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'user-growth', dateRange],
    queryFn: () => apiClient.get('/admin/analytics/user-growth', { params: dateRange }),
  });
}

export function useEngagementMetrics(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'engagement', dateRange],
    queryFn: () => apiClient.get('/admin/analytics/engagement', { params: dateRange }),
  });
}

export function useRevenueAnalytics(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue', dateRange],
    queryFn: () => apiClient.get('/admin/analytics/revenue', { params: dateRange }),
  });
}

// Reports
export function useReports(params?: any) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => apiClient.get('/admin/reports', { params }),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: any) =>
      apiClient.post('/admin/reports/generate', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: number) =>
      apiClient.get(`/admin/reports/${reportId}/download`, { responseType: 'blob' }),
  });
}

// Settings Management
export function useSystemSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiClient.get('/admin/settings'),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) =>
      apiClient.patch('/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

// Course Management (Admin)
export function useAdminCourses(params?: any) {
  return useQuery({
    queryKey: ['admin', 'courses', params],
    queryFn: () => apiClient.get('/admin/courses', { params }),
  });
}

export function useApproveCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) =>
      apiClient.post(`/admin/courses/${courseId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
}

export function useRejectCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, reason }: { courseId: number; reason?: string }) =>
      apiClient.post(`/admin/courses/${courseId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
}

// Event Management (Admin)
export function useAdminEvents(params?: any) {
  return useQuery({
    queryKey: ['admin', 'events', params],
    queryFn: () => apiClient.get('/admin/events', { params }),
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['admin', 'events', 'featured'],
    queryFn: () => apiClient.get('/admin/events/featured'),
  });
}

export function useSetEventFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, featured }: { eventId: number; featured: boolean }) =>
      apiClient.patch(`/admin/events/${eventId}/featured`, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// Job Management (Admin)
export function useAdminJobs(params?: any) {
  return useQuery({
    queryKey: ['admin', 'jobs', params],
    queryFn: () => apiClient.get('/admin/jobs', { params }),
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) =>
      apiClient.post(`/admin/jobs/${jobId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: number; reason?: string }) =>
      apiClient.post(`/admin/jobs/${jobId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });
}

// Post Management (Admin)
export function useAdminPosts(params?: any) {
  return useQuery({
    queryKey: ['admin', 'posts', params],
    queryFn: () => apiClient.get('/admin/posts', { params }),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: number; reason?: string }) =>
      apiClient.delete(`/admin/posts/${postId}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}

// Group Management (Admin)
export function useAdminGroups(params?: any) {
  return useQuery({
    queryKey: ['admin', 'groups', params],
    queryFn: () => apiClient.get('/admin/groups', { params }),
  });
}

export function useSuspendGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, reason }: { groupId: number; reason?: string }) =>
      apiClient.post(`/admin/groups/${groupId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
    },
  });
}

// Lookups Management
export function useLookups(type?: string) {
  return useQuery({
    queryKey: ['admin', 'lookups', type],
    queryFn: () => apiClient.get('/admin/lookups', { params: { type } }),
  });
}

export function useCreateLookup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post('/admin/lookups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lookups'] });
    },
  });
}

export function useUpdateLookup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/admin/lookups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lookups'] });
    },
  });
}

export function useDeleteLookup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/admin/lookups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lookups'] });
    },
  });
}

// Admin Lookups with CRUD hooks
export function useAdminLookups() {
  const baseHooks = createCrudHooks({
    resource: 'lookups',
    endpoint: '/admin/lookups',
    queryKey: ['admin', 'lookups'],
  });

  const queryClient = useQueryClient();
  
  const useReorder = () => {
    return useMutation({
      mutationFn: (items: Array<{ id: number; displayOrder: number }>) =>
        apiClient.post('/admin/lookups/reorder', { items }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'lookups'] });
      },
    });
  };

  return {
    ...baseHooks,
    useReorder,
  };
}

// Admin Lookup Types with CRUD hooks
export function useAdminLookupTypes() {
  return createCrudHooks({
    resource: 'lookup-types',
    endpoint: '/admin/lookup-types',
    queryKey: ['admin', 'lookup-types'],
  });
}

// Admin Reports with CRUD hooks
export function useAdminReports() {
  const baseHooks = createCrudHooks({
    resource: 'reports',
    endpoint: '/admin/reports',
    queryKey: ['admin', 'reports'],
  });

  const useStatistics = () => {
    return useQuery({
      queryKey: ['admin', 'reports', 'statistics'],
      queryFn: () => apiClient.get('/admin/reports/statistics'),
    });
  };

  return {
    ...baseHooks,
    useStatistics,
  };
}

// Admin Social Pages with CRUD hooks
export function useAdminSocialPages() {
  const baseHooks = createCrudHooks({
    resource: 'social-pages',
    endpoint: '/admin/social-pages',
    queryKey: ['admin', 'social-pages'],
  });

  const useStatistics = () => {
    return useQuery({
      queryKey: ['admin', 'social-pages', 'statistics'],
      queryFn: () => apiClient.get('/admin/social-pages/statistics'),
    });
  };

  return {
    ...baseHooks,
    useStatistics,
  };
}

// Tickets/Support
export function useAdminTickets(params?: any) {
  return useQuery({
    queryKey: ['admin', 'tickets', params],
    queryFn: () => apiClient.get('/admin/tickets', { params }),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['admin', 'tickets', id],
    queryFn: () => apiClient.get(`/admin/tickets/${id}`),
    enabled: !!id,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: number; status: string }) =>
      apiClient.patch(`/admin/tickets/${ticketId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: number; message: string }) =>
      apiClient.post(`/admin/tickets/${ticketId}/reply`, { message }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets', ticketId] });
    },
  });
}

// Admin CMS Pages with CRUD hooks
export function useAdminCmsPages() {
  const baseHooks = createCrudHooks({
    resource: 'cms-pages',
    endpoint: '/admin/cms-pages',
    queryKey: ['admin', 'cms-pages'],
  });

  const useStatistics = () => {
    return useQuery({
      queryKey: ['admin', 'cms-pages', 'statistics'],
      queryFn: () => apiClient.get('/admin/cms-pages/statistics'),
    });
  };

  return {
    ...baseHooks,
    useStatistics,
  };
}

export function useCmsPage(id: number) {
  return useQuery({
    queryKey: ['admin', 'cms-pages', id],
    queryFn: () => apiClient.get(`/admin/cms-pages/${id}`),
    enabled: !!id,
  });
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post('/admin/cms-pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms-pages'] });
    },
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/admin/cms-pages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms-pages'] });
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/admin/cms-pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms-pages'] });
    },
  });
}
