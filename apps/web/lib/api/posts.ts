import { apiClient } from './client';

export interface PostFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
}

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
  files?: PostFile[]; // Files linked to the post from media_library
  fileIds?: number[]; // Array of existing file IDs from media_library
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  entityType?: string;
  groupId?: number;
  pageId?: number;
  sharedPost?: Post; // Nested shared post data
}

export interface CreatePostDto {
  content: string;
  post_type: 'text' | 'image' | 'video' | 'link';
  visibility: 'public' | 'friends' | 'private';
  group_id?: number;
  page_id?: number;
  shared_post_id?: number;
  mentionIds?: number[];
  fileIds?: number[]; // Array of existing file IDs from media_library
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
   * Create a new post with optional file uploads
   * @param data - Post data
   * @param files - Optional array of files to upload
   */
  create: (data: CreatePostDto, files?: File[]) => {
    // If files are provided, use multipart/form-data
    if (files && files.length > 0) {
      const formData = new FormData();
      
      // Add text fields
      formData.append('content', data.content);
      formData.append('post_type', data.post_type);
      formData.append('visibility', data.visibility);
      
      if (data.group_id) {
        formData.append('group_id', data.group_id.toString());
      }
      if (data.page_id) {
        formData.append('page_id', data.page_id.toString());
      }
      if (data.mentionIds && data.mentionIds.length > 0) {
        formData.append('mentionIds', JSON.stringify(data.mentionIds));
      }
      if (data.fileIds && data.fileIds.length > 0) {
        formData.append('fileIds', JSON.stringify(data.fileIds));
      }
      
      // Add files
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // Don't set Content-Type header - axios will set it automatically with boundary for FormData
      return apiClient.post<Post>('/social/posts', formData);
    }
    
    // Otherwise, use JSON (for fileIds only or no files)
    if (data.fileIds && data.fileIds.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('post_type', data.post_type);
      formData.append('visibility', data.visibility);
      
      if (data.group_id) {
        formData.append('group_id', data.group_id.toString());
      }
      if (data.page_id) {
        formData.append('page_id', data.page_id.toString());
      }
      if (data.shared_post_id) {
        formData.append('shared_post_id', data.shared_post_id.toString());
      }
      if (data.mentionIds && data.mentionIds.length > 0) {
        formData.append('mentionIds', JSON.stringify(data.mentionIds));
      }
      formData.append('fileIds', JSON.stringify(data.fileIds));
      
      // Don't set Content-Type header - axios will set it automatically with boundary for FormData
      return apiClient.post<Post>('/social/posts', formData);
    }
    
    // Regular JSON request for text-only posts
    // If shared_post_id is provided, use FormData to ensure proper handling
    if (data.shared_post_id) {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('post_type', data.post_type);
      formData.append('visibility', data.visibility);
      if (data.shared_post_id) {
        formData.append('shared_post_id', data.shared_post_id.toString());
      }
      return apiClient.post<Post>('/social/posts', formData);
    }
    return apiClient.post<Post>('/social/posts', data);
  },
  
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
