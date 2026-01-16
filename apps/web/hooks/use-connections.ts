import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { connectionsAPI } from '@/lib/api/connections';

interface ConnectionsParams {
  searchQuery?: string;
  limit?: number;
}

/**
 * Hook to manage connections data
 */
export function useConnections(params: ConnectionsParams = {}) {
  const { searchQuery = '', limit = 50 } = params;
  const { data: session, status } = useSession();
  const isAuthenticated = !!session && status === 'authenticated';

  // Get connection stats
  const { data: stats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: async () => {
      try {
        const result = await connectionsAPI.getStats();
        return result || { totalConnections: 0, pendingRequests: 0, sentRequests: 0 };
      } catch (error) {
        // Return default stats on error
        return { totalConnections: 0, pendingRequests: 0, sentRequests: 0 };
      }
    },
    enabled: isAuthenticated,
    retry: false,
    placeholderData: { totalConnections: 0, pendingRequests: 0, sentRequests: 0 },
  });

  // Get pending requests
  const { data: pendingRequestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['connection-requests', 'pending'],
    queryFn: () => connectionsAPI.getPendingRequests({ limit }),
    enabled: isAuthenticated,
    retry: false,
  });

  // Get connections
  const { data: connectionsData, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['connections', searchQuery],
    queryFn: () => connectionsAPI.getConnections({ search: searchQuery, limit }),
    enabled: isAuthenticated,
    retry: false,
  });

  // Get suggestions
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['connection-suggestions'],
    queryFn: () => connectionsAPI.getSuggestions({ limit: 10 }),
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    stats,
    pendingRequests: pendingRequestsData?.data || [],
    connections: connectionsData?.data || [],
    suggestions: suggestionsData?.data || [],
    isLoadingRequests,
    isLoadingConnections,
    isLoadingSuggestions,
  };
}

/**
 * Hook to fetch connection stats only
 */
export function useConnectionStats() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session && status === 'authenticated';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: async () => {
      try {
        const result = await connectionsAPI.getStats();
        return result || { totalConnections: 0, pendingRequests: 0, sentRequests: 0 };
      } catch (error) {
        // Return default stats on error
        return { totalConnections: 0, pendingRequests: 0, sentRequests: 0 };
      }
    },
    enabled: isAuthenticated,
    retry: false,
    placeholderData: { totalConnections: 0, pendingRequests: 0, sentRequests: 0 },
  });

  return {
    data: stats || { totalConnections: 0, pendingRequests: 0, sentRequests: 0 },
    isLoading,
  };
}

/**
 * Hook to fetch pending connection requests only
 */
export function usePendingConnectionRequests(limit: number = 50) {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session && status === 'authenticated';

  const { data: pendingRequestsData, isLoading } = useQuery({
    queryKey: ['connection-requests', 'pending', limit],
    queryFn: () => connectionsAPI.getPendingRequests({ limit }),
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    data: pendingRequestsData,
    isLoading,
  };
}

/**
 * Hook to fetch connection suggestions only
 */
export function useConnectionSuggestions(limit: number = 10) {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session && status === 'authenticated';

  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['connection-suggestions', limit],
    queryFn: () => connectionsAPI.getSuggestions({ limit }),
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: false, // Don't retry on 401 errors
  });

  return {
    data: suggestionsData,
    isLoading,
  };
}
