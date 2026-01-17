'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api/client';
import { Notification, QueuedAction } from '@/types/notification';
import { playNotificationSound } from '@/lib/utils/notification-sound';
import socketClient from '@/lib/socket/client';

interface UseNotificationsOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  enableSound?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(
    typeof window !== 'undefined' 
      ? localStorage.getItem('notificationSound') !== 'false' 
      : true
  );
  
  const socketRef = useRef<Socket | null>(null);
  const actionQueueRef = useRef<QueuedAction[]>([]);
  const isMountedRef = useRef(true);

  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 2000,
    enableSound = true,
  } = options;

  // Load initial notifications from API
  const loadNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await apiClient.get<Notification[]>('/notifications/my-notifications');
      if (isMountedRef.current) {
        const notifs = (data || []).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
        setNotifications(notifs);
        
        // Update unread count
        const unread = notifs.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [session?.accessToken]);

  // Deduplicate notifications by ID
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        return prev; // Prevent duplicate
      }
      return [notification, ...prev];
    });
    
    setUnreadCount(prev => prev + 1);
    
    // Play sound if enabled
    if (soundEnabled && enableSound && document.visibilityState === 'visible') {
      playNotificationSound();
    }
  }, [soundEnabled, enableSound]);

  // Connect to WebSocket using existing socketClient
  const connect = useCallback(() => {
    if (!session?.accessToken) return;

    // Use existing socket connection from socketClient
    const socket = socketClient.getNotificationsSocket();
    
    if (!socket) {
      console.warn('Notifications socket not initialized by SocketProvider');
      return;
    }

    // Store reference
    socketRef.current = socket;
    setConnected(socket.connected);

    // Subscribe to user-specific room
    const user = session.user ;
    socket.emit('subscribe', {
      userId: user.id,
      roles: user.roles || [],
    });

    // Listen for notifications
    const handleNotification = (notification: any) => {
      console.log('📬 New notification received:', notification);
      addNotification({
        ...notification,
        createdAt: new Date(notification.createdAt || notification.timestamp),
        isRead: false,
      });
    };

    const handleConnect = () => {
      console.log('✅ Notifications WebSocket connected');
      setConnected(true);

      // Re-subscribe on reconnect
      const user = session.user ;
      socket.emit('subscribe', {
        userId: user.id,
        roles: user.roles || [],
      });

      // Process queued actions
      if (actionQueueRef.current.length > 0) {
        console.log(`Processing ${actionQueueRef.current.length} queued actions`);
        actionQueueRef.current.forEach(action => {
          if (action.type === 'markAsRead') {
            markAsRead(action.payload.id);
          } else if (action.type === 'delete') {
            deleteNotification(action.payload.id);
          } else if (action.type === 'markAllAsRead') {
            markAllAsRead();
          }
        });
        actionQueueRef.current = [];
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Notifications WebSocket disconnected');
      setConnected(false);
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('notification', handleNotification);

    // If already connected, trigger connect handler
    if (socket.connected) {
      handleConnect();
    }

    // Return cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification', handleNotification);
    };
  }, [session, addNotification]);

  // Disconnect from WebSocket (just cleanup listeners, don't disconnect the socket)
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Don't disconnect the socket - SocketProvider manages that
      // Just remove our event listeners
      socketRef.current.off('notification');
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // API call
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      
      // Rollback on error if offline
      if (!connected) {
        actionQueueRef.current.push({
          type: 'markAsRead',
          payload: { id },
          timestamp: Date.now(),
        });
      }
    }
  }, [connected]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
    );
    setUnreadCount(0);

    // API call
    try {
      await apiClient.post('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      
      if (!connected) {
        actionQueueRef.current.push({
          type: 'markAllAsRead',
          payload: {},
          timestamp: Date.now(),
        });
      }
    }
  }, [notifications, connected]);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // API call
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      
      if (!connected) {
        actionQueueRef.current.push({
          type: 'delete',
          payload: { id },
          timestamp: Date.now(),
        });
      }
    }
  }, [notifications, connected]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    const notificationIds = notifications.map(n => n.id);
    
    if (notificationIds.length === 0) return;

    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    // API call
    try {
      await apiClient.post('/notifications/bulk-delete', { notificationIds });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, [notifications]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('notificationSound', String(newValue));
      }
      return newValue;
    });
  }, []);

  // Initialize: Load notifications and setup WebSocket listeners
  useEffect(() => {
    isMountedRef.current = true;

    if (session?.accessToken) {
      // Load initial notifications
      loadNotifications();
      
      // Setup WebSocket listeners (always setup, even if autoConnect is false)
      // Since SocketProvider already connects, we just attach our listeners
      const cleanup = connect();
      
      // Return cleanup function
      return () => {
        isMountedRef.current = false;
        if (cleanup) cleanup();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // Add external notification (e.g., from FCM)
  const addExternalNotification = useCallback((notification: Notification) => {
    addNotification(notification);
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    connected,
    loading,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
    connect,
    disconnect,
    refresh: loadNotifications,
    addExternalNotification,
  };
}
