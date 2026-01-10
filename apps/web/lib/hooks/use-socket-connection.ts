import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocketStore } from '@/stores/socket.store';

/**
 * Hook to manage socket connections based on authentication state
 * Uses Zustand for state management instead of React Context
 * 
 * This hook should be called once at the app level (in providers)
 */
export function useSocketConnection() {
  const { data: session, status } = useSession();
  const { connectChat, connectNotifications, cleanup } = useSocketStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      const token = session.accessToken as string;
      
      // Connect both sockets with the access token
      connectChat(token);
      connectNotifications(token);
    } else if (status === 'unauthenticated') {
      // Cleanup on logout
      cleanup();
    }

    // Cleanup on unmount
    return () => {
      if (status === 'unauthenticated') {
        cleanup();
      }
    };
  }, [status, session?.accessToken]);
}
