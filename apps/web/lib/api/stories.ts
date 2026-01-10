import { apiClient } from './client';

export interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number; // For videos, in seconds
  caption?: string;
  backgroundColor?: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  isViewed?: boolean;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface StoryView {
  id: number;
  storyId: number;
  userId: number;
  viewedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateStoryDto {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number;
  caption?: string;
  backgroundColor?: string;
}

/**
 * Stories API Service
 * Handles all story-related API calls
 * 
 * Note: This may require backend implementation
 * Stories expire after 24 hours automatically
 */
export const storiesAPI = {
  /**
   * Get all active stories (not expired)
   */
  getAll: (params?: any) => 
    apiClient.get<Story[]>('/stories', { params }),
  
  /**
   * Get stories from a specific user
   */
  getUserStories: (userId: number) => 
    apiClient.get<Story[]>(`/stories/user/${userId}`),
  
  /**
   * Get my stories
   */
  getMyStories: () => 
    apiClient.get<Story[]>('/stories/my-stories'),
  
  /**
   * Get a single story by ID
   */
  getById: (id: number) => 
    apiClient.get<Story>(`/stories/${id}`),
  
  /**
   * Create a new story
   */
  create: (data: CreateStoryDto) => 
    apiClient.post<Story>('/stories', data),
  
  /**
   * Delete a story
   */
  delete: (id: number) => 
    apiClient.delete(`/stories/${id}`),
  
  /**
   * Mark story as viewed
   */
  markAsViewed: (id: number) => 
    apiClient.post(`/stories/${id}/view`),
  
  /**
   * Get story viewers
   */
  getViewers: (id: number, params?: any) => 
    apiClient.get<StoryView[]>(`/stories/${id}/viewers`, { params }),
  
  /**
   * Get archived stories (my own only)
   */
  getArchived: (params?: any) => 
    apiClient.get<Story[]>('/stories/archived', { params }),
  
  /**
   * Archive a story (instead of delete)
   */
  archive: (id: number) => 
    apiClient.post(`/stories/${id}/archive`),
};

export default storiesAPI;
