import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { apiClient } from '@/lib/api/client';

/**
 * FCM Handler - Manages Firebase Cloud Messaging
 * 
 * Features:
 * - Request notification permissions
 * - Get FCM token
 * - Handle foreground messages
 * - Register/unregister token with backend
 */
export class FCMHandler {
  private messaging: Messaging | null = null;
  private currentToken: string | null = null;
  private app: FirebaseApp | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        // Initialize Firebase app if not already initialized
        const existingApps = getApps();
        if (existingApps.length > 0) {
          this.app = existingApps[0];
        } else {
          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
          };
          this.app = initializeApp(firebaseConfig);
        }
        
        if (this.app) {
          this.messaging = getMessaging(this.app);
        }
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('FCM not initialized');
        return null;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        this.currentToken = token;
        console.log('✅ FCM token obtained');
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerToken(token?: string): Promise<boolean> {
    try {
      const fcmToken = token || this.currentToken;
      
      if (!fcmToken) {
        console.warn('No FCM token to register');
        return false;
      }

      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      };

      await apiClient.post('/notifications/fcm/register', {
        token: fcmToken,
        deviceType: 'web',
        deviceInfo,
      });

      console.log('✅ FCM token registered with backend');
      return true;
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
      return false;
    }
  }

  /**
   * Unregister token from backend
   */
  async unregisterToken(token?: string): Promise<boolean> {
    try {
      const fcmToken = token || this.currentToken;
      
      if (!fcmToken) {
        return false;
      }

      await apiClient.delete('/notifications/fcm/unregister', {
        data: { token: fcmToken },
      });

      console.log('✅ FCM token unregistered from backend');
      this.currentToken = null;
      return true;
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
      return false;
    }
  }

  /**
   * Handle foreground messages
   * Callback receives notification payload
   */
  onForegroundMessage(callback: (notification: any) => void) {
    if (!this.messaging) {
      console.warn('FCM not initialized');
      return () => {};
    }

    try {
      const unsubscribe = onMessage(this.messaging, (payload: MessagePayload) => {
        console.log('📬 FCM foreground message received:', payload);

        // Extract notification data
        const notification = {
          id: payload.data?.id ? parseInt(payload.data.id) : undefined,
          title: payload.notification?.title || 'New Notification',
          message: payload.notification?.body || '',
          linkUrl: payload.data?.linkUrl,
          type: payload.data?.type,
          createdAt: new Date(),
          isRead: false,
        };

        // Call the callback with notification data
        callback(notification);

        // Show browser notification if document is not focused
        if (document.visibilityState !== 'visible' && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.id?.toString(),
            data: notification,
          });
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to setup foreground message handler:', error);
      return () => {};
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshToken(): Promise<string | null> {
    try {
      // Unregister old token if exists
      if (this.currentToken) {
        await this.unregisterToken(this.currentToken);
      }

      // Get new token
      const newToken = await this.getToken();
      
      if (newToken) {
        // Register new token
        await this.registerToken(newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh FCM token:', error);
      return null;
    }
  }

  /**
   * Get current token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if FCM is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           this.messaging !== null;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const fcmHandler = new FCMHandler();
