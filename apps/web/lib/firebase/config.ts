import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAnalytics, Analytics } from 'firebase/analytics';

/**
 * Validate Firebase configuration
 * Ensures all required environment variables are present
 */
function validateFirebaseConfig(): boolean {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(
      '[Firebase] Missing environment variables:',
      missingVars.join(', '),
      '\nFirebase features may not work properly.'
    );
    return false;
  }

  return true;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase only on client side
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;
let firebaseApp: FirebaseApp | null = null;

/**
 * Initialize Firebase services with comprehensive error handling
 */
function initializeFirebase(): void {
  try {
    // Validate configuration first
    const isValid = validateFirebaseConfig();
    if (!isValid) {
      console.warn('[Firebase] Skipping initialization due to missing configuration');
      return;
    }

    // Initialize Firebase app
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('[Firebase] App initialized successfully');
    } else {
      firebaseApp = getApps()[0];
    }

    // Initialize Analytics
    try {
      analytics = getAnalytics(firebaseApp);
      console.log('[Firebase] Analytics initialized successfully');
    } catch (analyticsError) {
      console.warn('[Firebase] Failed to initialize Analytics:', analyticsError);
    }

    // Initialize Messaging (requires service worker support)
    if ('serviceWorker' in navigator) {
      try {
        messaging = getMessaging(firebaseApp);
        console.log('[Firebase] Messaging initialized successfully');
      } catch (messagingError) {
        console.warn('[Firebase] Failed to initialize Messaging:', messagingError);
      }
    } else {
      console.warn('[Firebase] Service workers not supported - Messaging unavailable');
    }
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
  }
}

// Initialize Firebase on client side only
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BJ-xa9vL8R3YTwY1yjqk613tnMQkOCxKKhulxAzRgUw8taD_8pgaq3KR4r9yBo-oMqvfFIib9T1PjBu15d_czKE',
      });
      
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function onMessageListener() {
  if (!messaging) {
    return Promise.reject('Firebase messaging not initialized');
  }

  return new Promise((resolve) => {
    onMessage(messaging!, (payload) => {
      resolve(payload);
    });
  });
}

export { messaging, analytics };
