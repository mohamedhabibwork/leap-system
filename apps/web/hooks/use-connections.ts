import { useQuery } from '@tanstack/react-query';
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

  // Get connection stats
  const { data: stats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: () => connectionsAPI.getStats(),
  });

  // Get pending requests
  const { data: pendingRequestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['connection-requests', 'pending'],
    queryFn: () => connectionsAPI.getPendingRequests({ limit }),
  });

  // Get connections
  const { data: connectionsData, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['connections', searchQuery],
    queryFn: () => connectionsAPI.getConnections({ search: searchQuery, limit }),
  });

  // Get suggestions
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['connection-suggestions'],
    queryFn: () => connectionsAPI.getSuggestions({ limit: 10 }),
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: () => connectionsAPI.getStats(),
  });

  return {
    data: stats,
    isLoading,
  };
}

/**
 * Hook to fetch pending connection requests only
 */
export function usePendingConnectionRequests(limit: number = 50) {
  const { data: pendingRequestsData, isLoading } = useQuery({
    queryKey: ['connection-requests', 'pending', limit],
    queryFn: () => connectionsAPI.getPendingRequests({ limit }),
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
  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['connection-suggestions', limit],
    queryFn: () => connectionsAPI.getSuggestions({ limit }),
  });

  return {
    data: suggestionsData,
    isLoading,
  };
}
