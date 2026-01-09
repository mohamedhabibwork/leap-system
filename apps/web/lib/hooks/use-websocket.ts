'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface AdminNotification {
  id?: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  actionUrl?: string;
  read?: boolean;
}

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * Hook for admin WebSocket connections
 */
export function useAdminWebSocket(options: WebSocketOptions = {}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
  } = options;

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!session?.accessToken) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: {
        token: session.accessToken,
      },
      reconnectionAttempts: reconnectAttempts,
      reconnectionDelay: reconnectDelay,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);

      // Subscribe to admin notifications
      const user = session.user as any;
      socket.emit('subscribe:admin', {
        userId: user.id,
        roles: user.roles || [],
      });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socket.on('admin:notification', (notification: AdminNotification) => {
      setNotifications((prev) => [
        { ...notification, read: false },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    socketRef.current = socket;
  }, [session, reconnectAttempts, reconnectDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId?: number) => {
    if (notificationId) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (socketRef.current) {
        socketRef.current.emit('notification:read', notificationId);
      }
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Clear a specific notification
  const clearNotification = useCallback((notificationId: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => {
      const notification = notifications.find((n) => n.id === notificationId);
      return notification && !notification.read ? prev - 1 : prev;
    });
  }, [notifications]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && session?.accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, session, connect, disconnect]);

  return {
    notifications,
    connected,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearNotification,
  };
}
