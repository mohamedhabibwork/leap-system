/**
 * Cache Configuration for TanStack Query
 * Defines cache times and strategies for different data types
 */

export const CACHE_CONFIG = {
  // Data that changes frequently
  realtime: {
    staleTime: 0, // Always consider stale
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  },
  
  // Social feed data
  feed: {
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
  
  // User profiles and static content
  profile: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  
  // Lists and collections
  list: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 15, // 15 minutes
  },
  
  // Detail pages
  detail: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
  },
  
  // Search results
  search: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
  
  // Static content
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  },
  
  // Notifications
  notifications: {
    staleTime: 1000 * 10, // 10 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
  },
};

/**
 * Get cache config for a specific query type
 */
export function getCacheConfig(type: keyof typeof CACHE_CONFIG) {
  return CACHE_CONFIG[type] || CACHE_CONFIG.list;
}

/**
 * Default query client config
 */
export const DEFAULT_QUERY_CONFIG = {
  queries: {
    staleTime: CACHE_CONFIG.list.staleTime,
    cacheTime: CACHE_CONFIG.list.cacheTime,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};
