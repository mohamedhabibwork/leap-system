'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toaster } from '@/components/ui/sonner';
import React, { useState } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { RBACProvider } from '@/lib/contexts/rbac-context';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { SocketConnectionProvider } from '../providers/socket-connection-provider';
import { ChatSocketProvider } from '../providers/chat-socket-provider';
import { NotificationProvider } from '@/lib/contexts/notification-context';

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


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <PayPalScriptProvider options={paypalOptions}>
            <AnalyticsProvider>
              <SocketConnectionProvider>
                <AuthProvider>
                  <NotificationProvider autoConnect={false}>
                    <RBACProvider>
                      {children}
                      <Toaster />
                    </RBACProvider>
                  </NotificationProvider>
                </AuthProvider>
              </SocketConnectionProvider>
            </AnalyticsProvider>
          </PayPalScriptProvider>
        </ApolloProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
