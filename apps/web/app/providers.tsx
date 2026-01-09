'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toaster } from '@/components/ui/sonner';
import { useState, useEffect } from 'react';
import socketClient from '@/lib/socket/client';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { RBACProvider } from '@/lib/contexts/rbac-context';

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
  }),
  cache: new InMemoryCache(),
});

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture',
};

function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.accessToken) {
      socketClient.connectToChat(session.accessToken as string);
      socketClient.connectToNotifications(session.accessToken as string);
    }
    
    return () => {
      socketClient.disconnect();
    };
  }, [session]);
  
  return <>{children}</>;
}

function FCMProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  useEffect(() => {
    const requestPermission = async () => {
      if (session?.user && typeof window !== 'undefined') {
        try {
          const { requestNotificationPermission } = await import('@/lib/firebase/config');
          const token = await requestNotificationPermission();
          
          if (token) {
            // Register device token with backend
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/register-device`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.accessToken}`,
              },
              body: JSON.stringify({ token }),
            });
            console.log('FCM token registered successfully');
          }
        } catch (error) {
          console.error('Error setting up FCM:', error);
        }
      }
    };
    
    requestPermission();
  }, [session]);
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <PayPalScriptProvider options={paypalOptions}>
            <SocketProvider>
              <FCMProvider>
                {children}
                <Toaster />
              </FCMProvider>
            </SocketProvider>
          </PayPalScriptProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
