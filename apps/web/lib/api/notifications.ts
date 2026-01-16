import { apiClient } from './client';

export interface Notification {
  id: number;
  uuid?: string;
  userId: number;
  notificationTypeId: number;
  type?: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string | Date;
  readAt?: string | Date;
  isDeleted?: boolean;
  deletedAt?: string | Date;
  data?: any;
  actor?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationType {
  id: string;
  name: string;
}

export interface NotificationCategory {
  id: string;
  name: string;
  types: NotificationType[];
}

export interface NotificationTypesResponse {
  categories: NotificationCategory[];
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  websocketEnabled: boolean;
  notifyOnPostLikes: boolean;
  notifyOnComments: boolean;
  notifyOnCommentReplies: boolean;
  notifyOnShares: boolean;
  notifyOnFriendRequests: boolean;
  notifyOnFriendRequestAccepted: boolean;
  notifyOnGroupJoins: boolean;
  notifyOnPageFollows: boolean;
  notifyOnMentions: boolean;
  notifyOnEventInvitations: boolean;
  categories: {
    social: { email: boolean; push: boolean; websocket: boolean };
    lms: { email: boolean; push: boolean; websocket: boolean };
    jobs: { email: boolean; push: boolean; websocket: boolean };
    events: { email: boolean; push: boolean; websocket: boolean };
    payments: { email: boolean; push: boolean; websocket: boolean };
    system: { email: boolean; push: boolean; websocket: boolean };
  };
}

export interface FCMDevice {
  id: number;
  deviceType?: string;
  deviceInfo?: any;
  isActive: boolean;
  createdAt: string | Date;
  lastUsedAt?: string | Date;
}

/**
 * Notifications API Service
 * Handles all notification-related API calls
 */
export const notificationsAPI = {
  /**
   * Get all user notifications
   */
  getAll: () => 
    apiClient.get<Notification[]>('/notifications/my-notifications'),
  
  /**
   * Get unread notifications
   */
  getUnread: () => 
    apiClient.get<Notification[]>('/notifications/unread'),
  
  /**
   * Get unread notification count
   */
  getUnreadCount: () => 
    apiClient.get<{ count: number }>('/notifications/unread-count'),
  
  /**
   * Get notification statistics
   */
  getStatistics: () => 
    apiClient.get<NotificationStatistics>('/notifications/statistics'),
  
  /**
   * Get available notification types
   */
  getTypes: () => 
    apiClient.get<NotificationTypesResponse>('/notifications/types'),
  
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
   * Bulk delete notifications
   */
  bulkDelete: (notificationIds: number[]) => 
    apiClient.post<{ success: boolean; deleted: number }>('/notifications/bulk-delete', { notificationIds }),
  
  /**
   * Delete all notifications
   */
  deleteAll: () => 
    apiClient.delete<{ message: string; deleted: number }>('/notifications/all'),
  
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
  
  /**
   * Register FCM device token
   */
  registerFCMToken: (token: string, deviceType?: string, deviceInfo?: any) => 
    apiClient.post<{ success: boolean; message: string; userId: number }>('/notifications/fcm/register', {
      token,
      deviceType,
      deviceInfo,
    }),
  
  /**
   * Unregister FCM device token
   */
  unregisterFCMToken: (token: string) => 
    apiClient.delete<{ success: boolean; message: string }>('/notifications/fcm/unregister', {
      data: { token },
    }),
  
  /**
   * Get registered FCM devices
   */
  getFCMDevices: () => 
    apiClient.get<{ success: boolean; devices: FCMDevice[] }>('/notifications/fcm/devices'),
};

export default notificationsAPI;
