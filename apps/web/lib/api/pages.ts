import { apiClient } from './client';

export interface Page {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  category?: string;
  isVerified: boolean;
  isFeatured: boolean;
  followerCount: number;
  isFollowing?: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePageDto {
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  profileImageUrl?: string;
  categoryId?: number;
  seo?: Record<string, any>;
}

export interface UpdatePageDto {
  name?: string;
  description?: string;
  coverImage?: string;
  category?: string;
}

export interface VerifyPageDto {
  isVerified: boolean;
}

/**
 * Pages API Service
 * Handles all page-related API calls with authentication
 */
export const pagesAPI = {
  /**
   * Get all pages with pagination and filtering
   */
  getAll: (params?: any) => 
    apiClient.get<Page[]>('/social/pages', { params }),
  
  /**
   * Get a single page by ID
   */
  getById: (id: number) => 
    apiClient.get<Page>(`/social/pages/${id}`),
  
  /**
   * Create a new page
   */
  create: (data: CreatePageDto) => 
    apiClient.post<Page>('/social/pages', data),
  
  /**
   * Update an existing page
   */
  update: (id: number, data: UpdatePageDto) => 
    apiClient.patch<Page>(`/social/pages/${id}`, data),
  
  /**
   * Delete a page
   */
  delete: (id: number) => 
    apiClient.delete(`/social/pages/${id}`),
  
  /**
   * Verify/unverify a page (admin)
   */
  verify: (id: number, dto: VerifyPageDto) => 
    apiClient.post(`/social/pages/${id}/verify`, dto),
  
  /**
   * Feature a page
   */
  feature: (id: number) => 
    apiClient.post(`/social/pages/${id}/feature`),
  
  /**
   * Unfeature a page
   */
  unfeature: (id: number) => 
    apiClient.delete(`/social/pages/${id}/feature`),
  
  /**
   * Get page statistics
   */
  getStatistics: () => 
    apiClient.get('/social/pages/statistics'),
};

export default pagesAPI;
