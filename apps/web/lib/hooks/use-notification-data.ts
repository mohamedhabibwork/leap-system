import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/stores/socket.store';
import { useNotificationStore } from '@/stores/notification.store';
import apiClient from '@/lib/api/client';
import { playNotificationSound } from '@/lib/utils/notification-sound';
import type { Notification } from '@/types/notification';

/**
 * Hook to manage notifications with TanStack Query and Zustand
 * Handles both API fetching and real-time updates via WebSocket
 * 
 * This replaces the old useEffect-based approach with:
 * - TanStack Query for server state
 * - Zustand for client state
 * - Minimal useEffect usage
 */
export function useNotificationData() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { notificationsSocket, notificationsConnected } = useSocketStore();
  const { 
    notifications, 
    unreadCount, 
    soundEnabled,
    addNotification, 
    setNotifications, 
    markAsRead: markAsReadInStore,
    markAllAsRead: markAllAsReadInStore,
    deleteNotification: deleteFromStore,
    clearAll: clearAllFromStore,
    toggleSound,
  } = useNotificationStore();

  // Fetch notifications using TanStack Query
  const { data: apiNotifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get<Notification[]>('/notifications/my-notifications');
      return response;
    },
    enabled: !!session?.accessToken,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });

  // Sync API data to Zustand store
  useEffect(() => {
    if (apiNotifications) {
      setNotifications(apiNotifications);
    }
  }, [apiNotifications, setNotifications]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: (_, id) => {
      markAsReadInStore(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/mark-all-read'),
    onSuccess: () => {
      markAllAsReadInStore();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/notifications/${id}`),
    onSuccess: (_, id) => {
      deleteFromStore(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => apiClient.delete<{ message: string; deleted: number }>('/notifications/all'),
    onSuccess: () => {
      clearAllFromStore();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!notificationsSocket) return;

    const handleNotification = (notification: any) => {
      console.log('📬 New notification received via WebSocket:', notification);
      
      // Convert notification to our format
      const formattedNotification: Notification = {
        id: notification.id,
        userId: notification.userId,
        notificationTypeId: notification.type || notification.notificationTypeId || 0,
        type: typeof notification.type === 'string' ? notification.type : undefined,
        title: notification.title,
        message: notification.message,
        linkUrl: notification.linkUrl,
        isRead: notification.isRead || false,
        createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
        readAt: notification.readAt ? new Date(notification.readAt) : undefined,
      };
      
      // Add to store
      addNotification(formattedNotification);
      
      // Play sound if enabled
      if (soundEnabled) {
        playNotificationSound();
      }
      
      // Refetch to ensure consistency
      refetch();
    };

    const handleConnect = () => {
      console.log('✅ Notifications WebSocket connected');
      
      // Subscribe to notifications
      const user = session?.user as any;
      if (user?.id || user?.userId) {
        const userId = user.id || user.userId;
        notificationsSocket.emit('subscribe', {
          userId: userId,
          roles: user.roles || [],
        });
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Notifications WebSocket disconnected');
    };

    const handleConnected = () => {
      console.log('✅ Notifications WebSocket connected event');
      handleConnect();
    };

    // Attach listeners
    notificationsSocket.on('connect', handleConnected);
    notificationsSocket.on('connected', handleConnected);
    notificationsSocket.on('disconnect', handleDisconnect);
    notificationsSocket.on('notification', handleNotification);

    // If already connected, trigger connect handler
    if (notificationsSocket.connected) {
      handleConnect();
    }

    // Cleanup
    return () => {
      notificationsSocket.off('connect', handleConnected);
      notificationsSocket.off('connected', handleConnected);
      notificationsSocket.off('disconnect', handleDisconnect);
      notificationsSocket.off('notification', handleNotification);
    };
  }, [notificationsSocket, session?.user, soundEnabled, addNotification, refetch]);

  return {
    notifications,
    unreadCount,
    soundEnabled,
    loading: isLoading,
    connected: notificationsConnected,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
    toggleSound,
    refresh: refetch,
  };
}
