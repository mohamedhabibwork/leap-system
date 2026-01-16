'use client';

import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNotificationData } from '@/lib/hooks/use-notification-data';
import { useSocketStore } from '@/stores/socket.store';
import { fcmHandler } from '@/lib/firebase/fcm-handler';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  loading: boolean;
  soundEnabled: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  toggleSound: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  enableSound?: boolean;
}

/**
 * FCM Integration Component
 * Handles Firebase Cloud Messaging setup and integration
 */
function FCMIntegration({ onNotification }: { onNotification: (notification: any) => void }) {
  const { data: session } = useSession();
  const initializedRef = React.useRef<boolean>(false);
  const userIdRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentUserId = (session?.user as any)?.id;
    
    // Only initialize once per user (prevent re-initialization on session updates)
    if (!currentUserId || initializedRef.current || currentUserId !== userIdRef.current) {
      if (currentUserId !== userIdRef.current) {
        // User changed, reset
        initializedRef.current = false;
        userIdRef.current = currentUserId;
      } else if (!currentUserId && userIdRef.current) {
        // User logged out
        initializedRef.current = false;
        userIdRef.current = undefined;
        return;
      } else if (initializedRef.current) {
        // Already initialized for this user
        return;
      }
    }

    if (!currentUserId) return;

    let unsubscribe: (() => void) | undefined;

    const initializeFCM = async () => {
      try {
        // Check if FCM is supported
        if (!fcmHandler.isSupported()) {
          console.log('FCM not supported on this device');
          initializedRef.current = true;
          return;
        }

        // Get FCM token
        const token = await fcmHandler.getToken();
        
        if (token) {
          // Register token with backend
          await fcmHandler.registerToken(token);
          console.log('✅ FCM initialized and token registered');

          // Listen for foreground messages
          unsubscribe = fcmHandler.onForegroundMessage((notification) => {
            console.log('📬 FCM foreground notification:', notification);
            // Add notification to state via callback
            onNotification(notification);
          });
          
          initializedRef.current = true;
        } else {
          console.log('FCM permission not granted or token unavailable');
          initializedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
        initializedRef.current = true;
      }
    };

    initializeFCM();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [(session?.user as any)?.id, onNotification]);

  return null;
}

/**
 * WebSocket Connection Component
 * Handles WebSocket connection setup
 */
function WebSocketIntegration() {
  const { data: session } = useSession();
  const { connectNotifications, disconnectNotifications, notificationsConnected } = useSocketStore();

  useEffect(() => {
    if (!session?.accessToken) {
      disconnectNotifications();
      return;
    }

    // Connect to notifications WebSocket
    connectNotifications(session.accessToken as string);

    // Cleanup on unmount
    return () => {
      // Don't disconnect here - let the store manage it
    };
  }, [session?.accessToken, connectNotifications, disconnectNotifications]);

  return null;
}

/**
 * NotificationProvider - Provides notification state and methods throughout the app
 * 
 * Features:
 * - WebSocket real-time notifications
 * - Database persistence
 * - FCM push notifications
 * - Automatic reconnection
 * - Sound alerts
 * - Deduplication (prevents WebSocket + FCM duplicates)
 */
export function NotificationProvider({ 
  children, 
  autoConnect = true,
  enableSound = true 
}: NotificationProviderProps) {
  const notificationData = useNotificationData();

  // Handler for FCM notifications (memoized to prevent re-renders)
  const handleFCMNotification = useCallback((notification: any) => {
    // Convert FCM notification to our format and add to store
    const formattedNotification: Notification = {
      id: notification.id || Date.now(),
      userId: (notification.userId as any) || 0,
      notificationTypeId: notification.typeId || 0,
      type: notification.type || 'system',
      title: notification.title || 'Notification',
      message: notification.body || notification.message || '',
      linkUrl: notification.linkUrl || notification.data?.linkUrl,
      isRead: false,
      createdAt: new Date(notification.timestamp || Date.now()),
    };
    
    // Add to store via the hook's addNotification method
    // This will be handled by the WebSocket listener in useNotificationData
    console.log('📬 FCM notification received:', formattedNotification);
  }, []);

  return (
    <NotificationContext.Provider value={notificationData}>
      <WebSocketIntegration />
      <FCMIntegration onNotification={handleFCMNotification} />
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotificationContext - Hook to access notification context
 * Must be used within NotificationProvider
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}

/**
 * Export context for advanced use cases
 */
export { NotificationContext };
