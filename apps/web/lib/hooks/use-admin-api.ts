import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { AdminQueryParams, AdminPaginatedResponse, BulkActionRequest } from '@leap-lms/shared-types';

export function useAdminEntity<T = any>(endpoint: string) {
  const queryClient = useQueryClient();

  const useList = (params: AdminQueryParams = {}) => {
    return useQuery<AdminPaginatedResponse<T>>({
      queryKey: [endpoint, 'list', params],
      queryFn: () =>
        apiClient.get(endpoint, {
          params: {
            page: params.page || 1,
            limit: params.limit || 10,
            search: params.search,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          },
        }),
    });
  };

  const useOne = (id: number) => {
    return useQuery<T>({
      queryKey: [endpoint, id],
      queryFn: () => apiClient.get(`${endpoint}/${id}`),
      enabled: !!id,
    });
  };

  const useStatistics = () => {
    return useQuery({
      queryKey: [endpoint, 'statistics'],
      queryFn: () => apiClient.get(`${endpoint}/statistics`),
    });
  };

  const useCreate = () => {
    return useMutation({
      mutationFn: (data: Partial<T>) => apiClient.post(endpoint, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<T> }) =>
        apiClient.patch(`${endpoint}/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      },
    });
  };

  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => apiClient.delete(`${endpoint}/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      },
    });
  };

  const useBulkAction = () => {
    return useMutation({
      mutationFn: (data: BulkActionRequest) => apiClient.post(`${endpoint}/bulk`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      },
    });
  };

  const useExport = () => {
    return useMutation({
      mutationFn: (params: AdminQueryParams) =>
        apiClient.get(`${endpoint}/export/csv`, { params }),
    });
  };

  const useReorder = () => {
    return useMutation({
      mutationFn: (items: Array<{ id: number; displayOrder: number }>) => 
        apiClient.post(`${endpoint}/reorder`, { items }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [endpoint] });
      },
    });
  };

  return {
    useList,
    useOne,
    useStatistics,
    useCreate,
    useUpdate,
    useDelete,
    useBulkAction,
    useExport,
    useReorder,
  };
}

// Entity-specific hooks
export const useAdminTickets = () => useAdminEntity('/tickets');
export const useAdminCMSPages = () => useAdminEntity('/cms');
export const useAdminEvents = () => useAdminEntity('/events');
export const useAdminJobs = () => useAdminEntity('/jobs');
export const useAdminPosts = () => useAdminEntity('/social/posts');
export const useAdminGroups = () => useAdminEntity('/social/groups');
export const useAdminSocialPages = () => useAdminEntity('/social/pages');
export const useAdminLookups = () => useAdminEntity('/lookups');
export const useAdminLookupTypes = () => useAdminEntity('/lookup-types');
export const useAdminReports = () => useAdminEntity('/reports');
