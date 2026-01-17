// Import Firebase scripts with error handling
// Using version 10.13.2 which has stable compat builds for service workers
// Version 12.7.0 may not have compat CDN builds available
try {
  importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
} catch (error) {
  console.error('[FCM SW] Failed to load Firebase scripts:', error);
  // Fallback: try alternative CDN or version
  try {
    importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');
  } catch (fallbackError) {
    console.error('[FCM SW] Failed to load Firebase scripts (fallback):', fallbackError);
    throw new Error('Firebase scripts failed to load');
  }
}

// Initialize Firebase in the service worker
// Configuration is passed via environment or can be set here
// For service workers, we need to use the config directly as env vars aren't available
const firebaseConfig = {
  apiKey: "AIzaSyCfrg-UmNhOm53jgXXxgd-eJtzh7Yi2K3s",
  authDomain: "leap-pm.firebaseapp.com",
  projectId: "leap-pm",
  storageBucket: "leap-pm.firebasestorage.app",
  messagingSenderId: "1069875222728",
  appId: "1:1069875222728:web:56bceea53f4fc2b24f2dfd",
  measurementId: "G-MVDGM1D2K8"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('[FCM SW] Firebase initialized successfully');
} catch (error) {
  console.error('[FCM SW] Failed to initialize Firebase:', error);
}

const messaging = firebase.messaging();

/**
 * Handle background messages (when app is not in focus)
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationBody = payload.notification?.body || 'You have a new notification';
  const notificationImage = payload.notification?.image || payload.data?.image;
  const notificationIcon = payload.notification?.icon || '/icon-192x192.png';
  const notificationData = payload.data || {};

  // Build notification options
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/badge-72x72.png',
    image: notificationImage,
    data: {
      ...notificationData,
      clickAction: notificationData.linkUrl || notificationData.url || '/hub/notifications',
      notificationId: notificationData.id,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/icons/view.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png',
      },
    ],
    tag: notificationData.id || `notification-${Date.now()}`, // Prevent duplicate notifications
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    silent: false,
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click events
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification click:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    // Just close the notification
    console.log('[FCM SW] Notification dismissed');
    return;
  }

  // Default action or 'open' action
  const urlToOpen = data.clickAction || '/hub/notifications';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        const baseUrl = self.location.origin;
        const fullUrl = urlToOpen.startsWith('http') ? urlToOpen : `${baseUrl}${urlToOpen}`;
        return clients.openWindow(fullUrl);
      }
    })
  );
});

/**
 * Handle notification close events
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[FCM SW] Notification closed:', event);
  // You can track notification dismissals here
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[FCM SW] Service worker activated');
  event.waitUntil(self.clients.claim());
});

/**
 * Handle service worker install
 */
self.addEventListener('install', (event) => {
  console.log('[FCM SW] Service worker installed');
  self.skipWaiting();
});
