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
  data?: any; // Additional metadata for notification (e.g., postId, courseId, etc.)
  actor?: {
    id: number;
    name: string;
    avatar?: string;
  };
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

export interface NotificationStatistics {
  total: number;
  unread: number;
  read: number;
}

export interface QueuedAction {
  type: 'markAsRead' | 'delete' | 'markAllAsRead';
  payload: any;
  timestamp: number;
}
