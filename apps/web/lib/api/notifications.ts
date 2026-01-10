import { apiClient } from './client';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actor?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    social: boolean;
    jobs: boolean;
    courses: boolean;
    system: boolean;
  };
}

/**
 * Notifications API Service
 * Handles all notification-related API calls
 */
export const notificationsAPI = {
  /**
   * Get all notifications with pagination
   */
  getAll: (params?: any) => 
    apiClient.get<{ data: Notification[]; total: number; unreadCount: number }>('/notifications', { params }),
  
  /**
   * Get unread notification count
   */
  getUnreadCount: () => 
    apiClient.get<{ count: number }>('/notifications/unread-count'),
  
  /**
   * Mark a notification as read
   */
  markAsRead: (id: number) => 
    apiClient.patch(`/notifications/${id}/read`),
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => 
    apiClient.post('/notifications/mark-all-read'),
  
  /**
   * Delete a notification
   */
  delete: (id: number) => 
    apiClient.delete(`/notifications/${id}`),
  
  /**
   * Delete all notifications
   */
  deleteAll: () => 
    apiClient.delete('/notifications/all'),
  
  /**
   * Get notification preferences
   */
  getPreferences: () => 
    apiClient.get<NotificationPreferences>('/notifications/preferences'),
  
  /**
   * Update notification preferences
   */
  updatePreferences: (preferences: Partial<NotificationPreferences>) => 
    apiClient.patch<NotificationPreferences>('/notifications/preferences', preferences),
};

export default notificationsAPI;
