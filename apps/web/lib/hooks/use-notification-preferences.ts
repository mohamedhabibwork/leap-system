'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  websocketEnabled: boolean;
  notifyOnPostLikes: boolean;
  notifyOnComments: boolean;
  notifyOnCommentReplies: boolean;
  notifyOnShares: boolean;
  notifyOnFriendRequests: boolean;
  notifyOnFriendRequestAccepted: boolean;
  notifyOnGroupJoins: boolean;
  notifyOnPageFollows: boolean;
  notifyOnMentions: boolean;
  notifyOnEventInvitations: boolean;
  categories: {
    social: { email: boolean; push: boolean; websocket: boolean };
    lms: { email: boolean; push: boolean; websocket: boolean };
    jobs: { email: boolean; push: boolean; websocket: boolean };
    events: { email: boolean; push: boolean; websocket: boolean };
    payments: { email: boolean; push: boolean; websocket: boolean };
    system: { email: boolean; push: boolean; websocket: boolean };
  };
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
      return response;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return await apiClient.patch('/notifications/preferences', data);
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
