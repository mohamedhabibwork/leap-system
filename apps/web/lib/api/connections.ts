import { apiClient } from './client';

export interface Connection {
  id: number;
  userId: number;
  connectedUserId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    role?: string;
    headline?: string;
  };
}

export interface ConnectionRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  fromUser?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    role?: string;
    headline?: string;
  };
}

export interface SendConnectionRequestDto {
  userId: number;
  message?: string;
}

export interface MutualConnection {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  headline?: string;
  mutualCount: number;
}

export interface ConnectionStats {
  totalConnections: number;
  pendingRequests: number;
  sentRequests: number;
}

/**
 * Connections API Service
 * Handles all connection-related API calls (LinkedIn-style networking)
 */
export const connectionsAPI = {
  /**
   * Get all connections for the current user
   */
  getConnections: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<{ data: Connection[]; total: number }>('/social/connections', { params }),

  /**
   * Get pending connection requests (received)
   */
  getPendingRequests: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: ConnectionRequest[]; total: number }>('/social/connections/requests/pending', { params }),

  /**
   * Get sent connection requests
   */
  getSentRequests: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: ConnectionRequest[]; total: number }>('/social/connections/requests/sent', { params }),

  /**
   * Send a connection request to another user
   */
  sendRequest: (data: SendConnectionRequestDto) =>
    apiClient.post<ConnectionRequest>('/social/connections/requests', data),

  /**
   * Accept a connection request
   */
  acceptRequest: (requestId: number) =>
    apiClient.post<Connection>(`/social/connections/requests/${requestId}/accept`),

  /**
   * Reject a connection request
   */
  rejectRequest: (requestId: number) =>
    apiClient.post(`/social/connections/requests/${requestId}/reject`),

  /**
   * Remove an existing connection
   */
  removeConnection: (connectionId: number) =>
    apiClient.delete(`/social/connections/${connectionId}`),

  /**
   * Get mutual connections between current user and another user
   */
  getMutualConnections: (userId: number) =>
    apiClient.get<{ data: MutualConnection[]; total: number }>(`/social/connections/mutual/${userId}`),

  /**
   * Get connection status with a specific user
   */
  getConnectionStatus: (userId: number) =>
    apiClient.get<{ status: 'none' | 'pending' | 'connected'; connectionId?: number; requestId?: number }>(
      `/social/connections/status/${userId}`
    ),

  /**
   * Get connection statistics
   */
  getStats: () =>
    apiClient.get<ConnectionStats>('/social/connections/stats'),

  /**
   * Get suggested connections (people you may know)
   */
  getSuggestions: (params?: { limit?: number }) =>
    apiClient.get<{ data: Connection[]; total: number }>('/social/connections/suggestions', { params }),

  /**
   * Block a user
   */
  blockUser: (userId: number) =>
    apiClient.post(`/social/connections/block/${userId}`),

  /**
   * Unblock a user
   */
  unblockUser: (userId: number) =>
    apiClient.delete(`/social/connections/block/${userId}`),

  /**
   * Get blocked users
   */
  getBlockedUsers: () =>
    apiClient.get<{ data: Connection[]; total: number }>('/social/connections/blocked'),
};

export default connectionsAPI;
