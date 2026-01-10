import { apiClient } from './client';

export interface Group {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  privacy: 'public' | 'private';
  memberCount: number;
  isJoined?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: string;
  joinedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  coverImage?: string;
  privacy: 'public' | 'private';
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  coverImage?: string;
  privacy?: 'public' | 'private';
}

/**
 * Groups API Service
 * Handles all group-related API calls with authentication
 */
export const groupsAPI = {
  /**
   * Get all groups with pagination and filtering
   */
  getAll: (params?: any) => 
    apiClient.get<Group[]>('/social/groups', { params }),
  
  /**
   * Get a single group by ID
   */
  getById: (id: number) => 
    apiClient.get<Group>(`/social/groups/${id}`),
  
  /**
   * Create a new group
   */
  create: (data: CreateGroupDto) => 
    apiClient.post<Group>('/social/groups', data),
  
  /**
   * Update an existing group
   */
  update: (id: number, data: UpdateGroupDto) => 
    apiClient.patch<Group>(`/social/groups/${id}`, data),
  
  /**
   * Delete a group
   */
  delete: (id: number) => 
    apiClient.delete(`/social/groups/${id}`),
  
  /**
   * Join a group
   */
  join: (id: number) => 
    apiClient.post(`/social/groups/${id}/join`),
  
  /**
   * Leave a group
   */
  leave: (id: number) => 
    apiClient.delete(`/social/groups/${id}/leave`),
  
  /**
   * Get group members
   */
  getMembers: (id: number, params?: any) => 
    apiClient.get<GroupMember[]>(`/social/groups/${id}/members`, { params }),
  
  /**
   * Add a member to a group
   */
  addMember: (id: number, userId: number) => 
    apiClient.post(`/social/groups/${id}/members`, { userId }),
  
  /**
   * Approve a group (admin)
   */
  approve: (id: number) => 
    apiClient.post(`/social/groups/${id}/approve`),
  
  /**
   * Reject a group (admin)
   */
  reject: (id: number) => 
    apiClient.delete(`/social/groups/${id}/approve`),
  
  /**
   * Feature a group
   */
  feature: (id: number) => 
    apiClient.post(`/social/groups/${id}/feature`),
  
  /**
   * Unfeature a group
   */
  unfeature: (id: number) => 
    apiClient.delete(`/social/groups/${id}/feature`),
  
  /**
   * Get group statistics
   */
  getStatistics: () => 
    apiClient.get('/social/groups/statistics'),
};

export default groupsAPI;
