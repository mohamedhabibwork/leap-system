'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { notificationsAPI, type NotificationTypesResponse } from '@/lib/api/notifications';

/**
 * Hook to fetch available notification types and categories
 */
export function useNotificationTypes() {
  const { data: session, status } = useSession();

  const query = useQuery({
    queryKey: ['notification-types'],
    queryFn: async () => {
      return await notificationsAPI.getTypes();
    },
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (types don't change often)
  });

  return {
    types: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
