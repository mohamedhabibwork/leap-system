'use client';

import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { fcmHandler } from '@/lib/firebase/fcm-handler';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  loading: boolean;
  soundEnabled: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  toggleSound: () => void;
  connect: () => void;
  disconnect: () => void;
  refresh: () => Promise<void>;
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
 * NotificationProvider - Provides notification state and methods throughout the app
 * 
 * Features:
 * - WebSocket real-time notifications
 * - Database persistence
 * - FCM push notifications
 * - Automatic reconnection
 * - Offline action queuing
 * - Sound alerts
 * - Deduplication (prevents WebSocket + FCM duplicates)
 */
export function NotificationProvider({ 
  children, 
  autoConnect = true,
  enableSound = true 
}: NotificationProviderProps) {
  const notificationHook = useNotifications({
    autoConnect,
    enableSound,
    reconnectAttempts: 5,
    reconnectDelay: 2000,
  });

  // Handler for FCM notifications (memoized to prevent re-renders)
  const handleFCMNotification = useCallback((notification: any) => {
    // Add FCM notification to state (deduplication handled by hook)
    if (notificationHook.addExternalNotification) {
      notificationHook.addExternalNotification(notification);
    }
  }, [notificationHook.addExternalNotification]);

  return (
    <NotificationContext.Provider value={notificationHook}>
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
