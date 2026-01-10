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
  createdAt: Date | string;
  readAt?: Date | string;
  isDeleted?: boolean;
  deletedAt?: Date | string;
}

export interface NotificationFilter {
  type?: string;
  category?: string;
  unreadOnly: boolean;
}

export interface NotificationCategory {
  id: string;
  name: string;
  types: NotificationType[];
}

export interface NotificationType {
  id: string;
  name: string;
}

export interface NotificationTypesResponse {
  categories: NotificationCategory[];
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export interface QueuedAction {
  type: 'markAsRead' | 'delete' | 'markAllAsRead';
  payload: any;
  timestamp: number;
}
