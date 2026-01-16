'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api/notifications';
import { toast } from 'sonner';

/**
 * Hook to manage FCM token registration
 * Automatically registers token when available and user is authenticated
 */
export function useFCMToken() {
  const { data: session, status } = useSession();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check if FCM is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported(
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      );
    }
  }, []);

  // Get registered devices
  const { data: devicesData, refetch: refetchDevices } = useQuery({
    queryKey: ['fcm-devices'],
    queryFn: () => notificationsAPI.getFCMDevices(),
    enabled: status === 'authenticated' && isSupported,
  });

  // Register token mutation
  const registerMutation = useMutation({
    mutationFn: async (data: { token: string; deviceType?: string; deviceInfo?: any }) => {
      return notificationsAPI.registerFCMToken(data.token, data.deviceType, data.deviceInfo);
    },
    onSuccess: () => {
      toast.success('Push notifications enabled');
      refetchDevices();
    },
    onError: (error: any) => {
      console.error('Failed to register FCM token:', error);
      toast.error('Failed to enable push notifications');
    },
  });

  // Unregister token mutation
  const unregisterMutation = useMutation({
    mutationFn: async (token: string) => {
      return notificationsAPI.unregisterFCMToken(token);
    },
    onSuccess: () => {
      toast.success('Push notifications disabled');
      refetchDevices();
    },
    onError: (error: any) => {
      console.error('Failed to unregister FCM token:', error);
      toast.error('Failed to disable push notifications');
    },
  });

  // Request notification permission and get FCM token
  const requestPermission = async (): Promise<string | null> => {
    if (!isSupported) {
      console.warn('FCM is not supported in this browser');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return null;
      }

      // Get FCM token (this would typically come from Firebase SDK)
      // For now, we'll use a placeholder - you'll need to integrate Firebase
      const token = await getFCMTokenFromFirebase();
      
      if (token) {
        setFcmToken(token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return null;
    }
  };

  // Placeholder for Firebase token retrieval
  // You'll need to integrate Firebase Cloud Messaging SDK
  const getFCMTokenFromFirebase = async (): Promise<string | null> => {
    // TODO: Integrate Firebase Cloud Messaging
    // Example:
    // const messaging = getMessaging();
    // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    // return token;
    
    console.warn('FCM token retrieval not implemented. Please integrate Firebase SDK.');
    return null;
  };

  // Auto-register token when user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && isSupported && !fcmToken) {
      // Check if we already have a token stored
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        setFcmToken(storedToken);
        // Re-register the token
        registerMutation.mutate({
          token: storedToken,
          deviceType: getDeviceType(),
          deviceInfo: getDeviceInfo(),
        });
      } else {
        // Request permission and get new token
        requestPermission().then((token) => {
          if (token) {
            localStorage.setItem('fcm_token', token);
            registerMutation.mutate({
              token,
              deviceType: getDeviceType(),
              deviceInfo: getDeviceInfo(),
            });
          }
        });
      }
    }
  }, [status, isSupported, fcmToken]);

  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/windows/.test(userAgent)) return 'windows';
    if (/mac/.test(userAgent)) return 'mac';
    if (/linux/.test(userAgent)) return 'linux';
    return 'unknown';
  };

  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  };

  const registerToken = async (token: string, deviceType?: string, deviceInfo?: any) => {
    registerMutation.mutate({ token, deviceType, deviceInfo });
  };

  const unregisterToken = async (token: string) => {
    unregisterMutation.mutate(token);
    localStorage.removeItem('fcm_token');
    setFcmToken(null);
  };

  return {
    fcmToken,
    isSupported,
    devices: devicesData?.devices || [],
    isLoading: registerMutation.isPending || unregisterMutation.isPending,
    registerToken,
    unregisterToken,
    requestPermission,
    refetchDevices,
  };
}
