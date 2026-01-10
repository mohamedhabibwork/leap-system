import { apiClient } from './client';

export interface SearchResult {
  type: 'user' | 'post' | 'group' | 'page' | 'event' | 'job' | 'course';
  id: number;
  title: string;
  description?: string;
  image?: string;
  metadata?: any;
  relevance?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets?: {
    types: Record<string, number>;
    categories?: Record<string, number>;
  };
}

export interface SearchParams {
  query: string;
  type?: 'user' | 'post' | 'group' | 'page' | 'event' | 'job' | 'course' | 'all';
  filters?: {
    category?: string;
    location?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    priceRange?: {
      min: number;
      max: number;
    };
  };
  sort?: 'relevance' | 'date' | 'popularity';
  limit?: number;
  offset?: number;
}

export interface SearchSuggestion {
  query: string;
  type?: string;
  count?: number;
}

/**
 * Search API Service
 * Handles all search-related API calls with multi-entity support
 */
export const searchAPI = {
  /**
   * Global search across all content types
   */
  search: (params: SearchParams) => 
    apiClient.get<SearchResponse>('/search', { params }),
  
  /**
   * Get search suggestions/autocomplete
   */
  getSuggestions: (query: string, limit = 10) => 
    apiClient.get<SearchSuggestion[]>('/search/suggestions', { 
      params: { query, limit } 
    }),
  
  /**
   * Get trending searches
   */
  getTrending: (limit = 10) => 
    apiClient.get<SearchSuggestion[]>('/search/trending', { params: { limit } }),
  
  /**
   * Get recent searches (client-side storage + server)
   */
  getRecentSearches: (limit = 10) => {
    if (typeof window === 'undefined') {
      return Promise.resolve({ data: [] });
    }
    
    // Get from localStorage
    const recent = localStorage.getItem('recent_searches');
    if (!recent) {
      return Promise.resolve({ data: [] });
    }
    
    try {
      const searches = JSON.parse(recent);
      return Promise.resolve({ 
        data: searches.slice(0, limit) as SearchSuggestion[] 
      });
    } catch (error) {
      return Promise.resolve({ data: [] });
    }
  },
  
  /**
   * Save a search to recent searches
   */
  saveRecentSearch: (query: string, type?: string) => {
    if (typeof window === 'undefined') return;
    
    const recent = localStorage.getItem('recent_searches');
    let searches: SearchSuggestion[] = [];
    
    if (recent) {
      try {
        searches = JSON.parse(recent);
      } catch (error) {
        searches = [];
      }
    }
    
    // Remove if already exists
    searches = searches.filter(s => s.query !== query);
    
    // Add to beginning
    searches.unshift({ query, type });
    
    // Keep only last 20
    searches = searches.slice(0, 20);
    
    localStorage.setItem('recent_searches', JSON.stringify(searches));
  },
  
  /**
   * Clear recent searches
   */
  clearRecentSearches: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recent_searches');
    }
  },
  
  /**
   * Search users
   */
  searchUsers: (query: string, params?: any) => 
    apiClient.get('/search/users', { params: { query, ...params } }),
  
  /**
   * Search posts
   */
  searchPosts: (query: string, params?: any) => 
    apiClient.get('/search/posts', { params: { query, ...params } }),
  
  /**
   * Search groups
   */
  searchGroups: (query: string, params?: any) => 
    apiClient.get('/search/groups', { params: { query, ...params } }),
  
  /**
   * Search pages
   */
  searchPages: (query: string, params?: any) => 
    apiClient.get('/search/pages', { params: { query, ...params } }),
  
  /**
   * Search events
   */
  searchEvents: (query: string, params?: any) => 
    apiClient.get('/search/events', { params: { query, ...params } }),
  
  /**
   * Search jobs
   */
  searchJobs: (query: string, params?: any) => 
    apiClient.get('/search/jobs', { params: { query, ...params } }),
  
  /**
   * Search courses
   */
  searchCourses: (query: string, params?: any) => 
    apiClient.get('/search/courses', { params: { query, ...params } }),
};

export default searchAPI;
