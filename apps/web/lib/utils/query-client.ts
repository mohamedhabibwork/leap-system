import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Get or create a QueryClient instance for server-side prefetching
 * Uses React's cache() to ensure the same instance is used during a request
 */
export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for server prefetch
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
});
