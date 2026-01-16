'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { notificationsAPI, type NotificationStatistics } from '@/lib/api/notifications';

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStatistics() {
  const { data: session, status } = useSession();

  const query = useQuery({
    queryKey: ['notification-statistics'],
    queryFn: async () => {
      return await notificationsAPI.getStatistics();
    },
    enabled: status === 'authenticated',
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });

  return {
    statistics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
