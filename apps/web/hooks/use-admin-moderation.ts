import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

/**
 * Hook for admin moderation - fetching reports and statistics
 */
export function useAdminReports(statusFilter: string = 'pending') {
  return useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: async () => {
      try {
        return await apiClient.get<{ data: any[] }>('/admin/reports', { 
          params: { status: statusFilter } 
        });
      } catch {
        // Fallback to tickets if reports endpoint doesn't exist
        return await apiClient.get<{ data: any[] }>('/tickets', { 
          params: { category: 'report', status: statusFilter } 
        });
      }
    },
  });
}

/**
 * Hook for admin moderation statistics
 */
export function useAdminReportsStats(reports: any[] = []) {
  return useQuery({
    queryKey: ['admin-reports-stats'],
    queryFn: async () => {
      try {
        return await apiClient.get<{
          pending: number;
          approved: number;
          rejected: number;
          today: number;
        }>('/admin/reports/statistics');
      } catch {
        return {
          pending: reports.filter((r: any) => r.status === 'pending').length,
          approved: reports.filter((r: any) => r.status === 'approved').length,
          rejected: reports.filter((r: any) => r.status === 'rejected').length,
          today: reports.filter((r: any) => {
            const today = new Date();
            const reportDate = new Date(r.createdAt);
            return reportDate.toDateString() === today.toDateString();
          }).length,
        };
      }
    },
  });
}

/**
 * Hook for approving a report
 */
export function useApproveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, note }: { reportId: number; note?: string }) => {
      return apiClient.post(`/admin/reports/${reportId}/approve`, { note });
    },
    onSuccess: () => {
      toast.success('Report approved and action taken');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Failed to approve report');
    },
  });
}

/**
 * Hook for rejecting a report
 */
export function useRejectReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, note }: { reportId: number; note?: string }) => {
      return apiClient.post(`/admin/reports/${reportId}/reject`, { note });
    },
    onSuccess: () => {
      toast.success('Report rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Failed to reject report');
    },
  });
}
