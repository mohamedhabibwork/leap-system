'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register in production or when explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_PWA) {
      console.log('[SW] PWA disabled in development mode');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        // Register the main PWA service worker
        // Note: This works alongside firebase-messaging-sw.js
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[SW] New service worker available');
              
              // Optionally show update notification to user
              if (window.confirm('A new version is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW] Message from service worker:', event.data);
        });

        // Handle service worker errors
        navigator.serviceWorker.addEventListener('error', (error) => {
          console.error('[SW] Service worker error:', error);
        });
      } catch (error) {
        console.error('[SW] Service worker registration failed:', error);
      }
    };

    // Register after a short delay to avoid blocking initial load
    const timeoutId = setTimeout(registerServiceWorker, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
