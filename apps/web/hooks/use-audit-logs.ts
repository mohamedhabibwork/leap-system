import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface AuditLogsFilters {
  search?: string;
  level?: string;
  action?: string;
}

interface AuditLogsPagination {
  page: number;
  pageSize: number;
}

/**
 * Hook to fetch audit logs
 */
export function useAuditLogs(filters: AuditLogsFilters = {}, pagination: AuditLogsPagination = { page: 1, pageSize: 20 }) {
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', filters, pagination],
    queryFn: () =>
      apiClient.get('/admin/audit-logs', {
        params: {
          search: filters.search,
          level: filters.level,
          action: filters.action,
          page: pagination.page,
          pageSize: pagination.pageSize,
        },
      }),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['admin', 'audit-logs', 'stats'],
    queryFn: () => apiClient.get('/admin/audit-logs/stats'),
  });

  return {
    logs: logsResponse?.data || [],
    total: logsResponse?.total || 0,
    stats: statsResponse?.data || {},
    isLoading,
  };
}
