import { apiClient } from './client';

export interface Post {
  id: number;
  userId: number;
  content: string;
  images?: string[];
  visibility: string;
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  entityType?: string;
  groupId?: number;
  pageId?: number;
}

export interface CreatePostDto {
  content: string;
  post_type: 'text' | 'image' | 'video' | 'link';
  visibility: 'public' | 'friends' | 'private';
  group_id?: number;
  page_id?: number;
}

export interface UpdatePostDto {
  content?: string;
  visibility?: string;
  images?: string[];
}

/**
 * Posts API Service
 * Handles all post-related API calls with authentication
 */
export const postsAPI = {
  /**
   * Get all posts with pagination and filtering
   */
  getAll: (params?: any) => 
    apiClient.get<any>('/social/posts', { params }),
  
  /**
   * Get a single post by ID
   */
  getById: (id: number) => 
    apiClient.get<Post>(`/social/posts/${id}`),
  
  /**
   * Create a new post
   */
  create: (data: CreatePostDto) => 
    apiClient.post<Post>('/social/posts', data),
  
  /**
   * Update an existing post
   */
  update: (id: number, data: UpdatePostDto) => 
    apiClient.patch<Post>(`/social/posts/${id}`, data),
  
  /**
   * Delete a post
   */
  delete: (id: number) => 
    apiClient.delete(`/social/posts/${id}`),
  
  /**
   * Toggle like on a post
   */
  toggleLike: (id: number) => 
    apiClient.post(`/social/posts/${id}/like`),
  
  /**
   * Hide a post (moderation)
   */
  hide: (id: number) => 
    apiClient.post(`/social/posts/${id}/hide`),
  
  /**
   * Unhide a post (moderation)
   */
  unhide: (id: number) => 
    apiClient.delete(`/social/posts/${id}/hide`),
  
  /**
   * Get post statistics
   */
  getStatistics: () => 
    apiClient.get('/social/posts/statistics'),
};

export default postsAPI;
