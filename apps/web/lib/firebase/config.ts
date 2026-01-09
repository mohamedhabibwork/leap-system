import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client side
let messaging: Messaging | null = null;

if (typeof window !== 'undefined' && !getApps().length) {
  const app = initializeApp(firebaseConfig);
  
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
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
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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

export { messaging };
