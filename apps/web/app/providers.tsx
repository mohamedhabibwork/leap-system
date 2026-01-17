'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
// PayPal removed - using mock payment instead
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import React, { useState } from 'react';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { RBACProvider } from '@/lib/contexts/rbac-context';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { SocketConnectionProvider } from '../providers/socket-connection-provider';
import { ChatSocketProvider } from '../providers/chat-socket-provider';
import { NotificationProvider } from '@/lib/contexts/notification-context';
import { getSession } from 'next-auth/react';
import { env } from '@/lib/config/env';

// Create auth link to add token to GraphQL requests
const authLink = setContext(async (_, { headers }) => {
  // Get token from NextAuth session
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      // Extract token from session (try multiple possible locations)
      token = 
        (session )?.accessToken ||
        (session )?.access_token ||
        (session )?.token ||
        (session )?.user?.accessToken ||
        (session )?.user?.access_token ||
        null;
    } catch (error) {
      // Silently handle session fetch errors
      // Some GraphQL queries might be public and don't require authentication
      console.warn('[Apollo Client] Error getting session:', error);
    }
  }

  // Return headers with Authorization if token is available
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Create HTTP link
const httpLink = new HttpLink({
  uri: env.graphqlUrl || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

// Combine auth link with HTTP link
const link = from([authLink, httpLink]);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});


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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={apolloClient}>
            <AnalyticsProvider>
              <SocketConnectionProvider>
                <AuthProvider>
                  <NotificationProvider autoConnect={true}>
                    <RBACProvider>
                      {children}
                      <Toaster />
                    </RBACProvider>
                  </NotificationProvider>
                </AuthProvider>
              </SocketConnectionProvider>
            </AnalyticsProvider>
          </ApolloProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          )}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
