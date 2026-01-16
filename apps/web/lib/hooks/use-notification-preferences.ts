'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI, type NotificationPreferences } from '@/lib/api/notifications';

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      return await notificationsAPI.getPreferences();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return await notificationsAPI.updatePreferences(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    refetch: query.refetch,
  };
}
