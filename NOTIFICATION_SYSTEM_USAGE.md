# Notification System - Developer Guide

## Quick Start

### Backend: Triggering Notifications

To trigger a notification from any service:

```typescript
// 1. Inject NotificationsService in your service constructor
constructor(
  private readonly notificationsService: NotificationsService,
) {}

// 2. Get the notification type ID from lookups
const [notifType] = await this.db
  .select({ id: lookups.id })
  .from(lookups)
  .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
  .where(and(
    eq(lookupTypes.code, 'notification_type'),
    eq(lookups.code, 'your_notification_code') // e.g., 'post_reaction'
  ))
  .limit(1);

// 3. Send multi-channel notification
await this.notificationsService.sendMultiChannelNotification({
  userId: recipientUserId,
  notificationTypeId: notifType.id,
  title: 'Short Title',
  message: 'Descriptive message',
  linkUrl: '/path/to/resource',
  channels: ['database', 'websocket', 'fcm', 'email'],
  emailData: {
    templateMethod: 'sendYourEmail',
    data: { /* template data */ }
  },
  pushData: {
    type: 'custom_type',
    resourceId: 'id',
  }
});
```

### Frontend: Using Existing Hooks

```typescript
import { 
  useTogglePostLike, 
  useCreateComment,
  useCreateShare,
  useSendFriendRequest,
  useJoinGroup,
  useFollowPage
} from '@/lib/hooks/use-api';

// Example: Like a post
const toggleLike = useTogglePostLike();
await toggleLike.mutateAsync(postId);

// Example: Comment on a post
const createComment = useCreateComment();
await createComment.mutateAsync({
  commentableType: 'post',
  commentableId: postId,
  content: 'Great post! @username check this out',
  parentCommentId: null, // or parent comment ID for replies
});
```

### Frontend: Managing User Preferences

```typescript
import { useNotificationPreferences } from '@/lib/hooks/use-notification-preferences';

function SettingsComponent() {
  const { preferences, update, isUpdating } = useNotificationPreferences();
  
  const handleToggle = async () => {
    await update({
      notifyOnPostLikes: false, // Disable post like notifications
      categories: {
        ...preferences.categories,
        social: { email: false, push: true, websocket: true }
      }
    });
  };
  
  return (
    <Switch 
      checked={preferences?.notifyOnPostLikes}
      onCheckedChange={handleToggle}
    />
  );
}
```

## Available Notification Types

### Social (13 types)
- `post_reaction` - Someone liked your post
- `post_comment` - Someone commented on your post
- `comment_reply` - Someone replied to your comment
- `post_share` - Someone shared your post
- `friend_request_received` - You received a friend request
- `friend_request_accepted` - Your friend request was accepted
- `group_join` - Someone joined your group (admin/mod only)
- `group_invitation` - You were invited to a group
- `page_follow` - Someone followed your page
- `page_like` - Someone liked your page
- `mention` - Someone @mentioned you
- `event_invitation` - You were invited to an event
- `event_reminder` - Event starting soon

### LMS (12 types)
Course enrollment, completion, assignments, quizzes, certificates, etc.

### Jobs (8 types)
Applications, interviews, offers, rejections, etc.

### Tickets (6 types)
Ticket created, assigned, replies, status changes, etc.

### Payments (6 types)
Payment success/failure, refunds, subscription management, etc.

### System (8 types)
Account verification, security alerts, maintenance, welcome, etc.

## Email Templates

All templates are located in `apps/backend/src/modules/notifications/templates/`

### Using an Email Template

```typescript
// In email.service.ts
import { getPostReactionTemplate, PostReactionData } from './templates/social';

async sendPostReactionEmail(toEmail: string, data: PostReactionData) {
  const html = getPostReactionTemplate(data);
  return this.sendEmail({
    to: toEmail,
    subject: `${data.reactorName} reacted to your post`,
    html,
  });
}
```

### Template Data Interfaces

Each template has a corresponding TypeScript interface:

```typescript
export interface PostReactionData {
  userName: string;
  reactorName: string;
  reactionType: string; // 'like', 'love', etc.
  postUrl: string;
  totalReactions: number;
  postTitle?: string;
}
```

## Notification Channels

### 1. Database (Always Stored)
- Stored in `notifications` table
- Persists notification history
- Used for notification center display

### 2. WebSocket (Real-time)
- Instant delivery to active users
- Triggers UI updates immediately
- Plays sound if enabled
- Shows toast notifications

### 3. FCM (Push Notifications)
- Mobile push notifications
- Browser push notifications
- Requires user device registration
- Respects user preferences

### 4. Email
- Beautiful HTML templates
- Sent asynchronously
- Respects user preferences
- Includes unsubscribe links

## User Preference Levels

Notifications respect 3 levels of preferences:

### 1. Global Toggle
```typescript
emailEnabled: true,     // Master email toggle
pushEnabled: true,      // Master push toggle
websocketEnabled: true  // Master real-time toggle
```

### 2. Category Level
```typescript
categories: {
  social: { email: true, push: true, websocket: true },
  lms: { email: true, push: false, websocket: true },
  // ...
}
```

### 3. Action Level
```typescript
notifyOnPostLikes: true,
notifyOnComments: true,
notifyOnMentions: true,
// ...
```

**Logic**: All three levels must be `true` for a notification to be sent via that channel.

## Best Practices

### 1. Prevent Self-Notifications
```typescript
if (post.userId !== userId) {
  // Only notify if different user
  await this.notificationsService.sendMultiChannelNotification({...});
}
```

### 2. Use Appropriate Channels
```typescript
// High priority - use all channels
channels: ['database', 'websocket', 'fcm', 'email']

// Medium priority - skip email
channels: ['database', 'websocket', 'fcm']

// Low priority - database only
channels: ['database', 'websocket']
```

### 3. Provide Helpful Link URLs
```typescript
linkUrl: `/posts/${postId}#comment-${commentId}` // Deep link to specific comment
```

### 4. Error Handling
```typescript
try {
  await this.notificationsService.sendMultiChannelNotification({...});
  this.logger.log('Notification sent successfully');
} catch (error) {
  this.logger.error('Failed to send notification:', error);
  // Continue execution - don't fail the main operation
}
```

### 5. Batch Notifications
```typescript
// For notifying multiple users (e.g., all group members)
await this.notificationsService.sendBulkNotifications({
  userIds: [1, 2, 3, 4],
  notificationTypeId: notifType.id,
  title: 'Group Announcement',
  message: 'New post in your group',
  linkUrl: `/groups/${groupId}`,
  channels: ['database', 'websocket'],
});
```

## Testing

### Backend Testing
```bash
# Run unit tests
bun test

# Test specific endpoint
curl -X POST http://localhost:4000/social/posts/1/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing
```typescript
// Test notification hook
const { notifications, markAsRead } = useNotifications();

// Test preferences hook
const { preferences, update } = useNotificationPreferences();
```

### Manual Testing Flow
1. User A likes User B's post
2. Check User B's notification center - should show notification
3. Check browser console - should see WebSocket message
4. Check email inbox - should receive email (if enabled)
5. Check database - notification should be in `notifications` table

## Troubleshooting

### Notifications Not Appearing

1. **Check WebSocket connection**:
   ```typescript
   const { connected } = useNotifications();
   console.log('WebSocket connected:', connected);
   ```

2. **Check user preferences**:
   ```bash
   SELECT * FROM user_notification_preferences WHERE user_id = YOUR_USER_ID;
   ```

3. **Check notification types exist**:
   ```bash
   SELECT * FROM lookups WHERE lookup_type_id = (
     SELECT id FROM lookup_types WHERE code = 'notification_type'
   );
   ```

4. **Check backend logs**:
   ```bash
   # Look for notification service logs
   grep "Notification sent" logs/backend.log
   ```

### Email Not Sending

1. Check SMTP configuration in `.env`
2. Check email service logs
3. Verify user has email enabled in preferences
4. Verify category has email enabled

### @Mentions Not Working

1. Check username exists in database
2. Check mention regex: `/@(\w+)/g`
3. Check `mention` notification type exists
4. Verify `notifyOnMentions: true` in preferences

## API Reference

### Notification Endpoints
- `GET /notifications/my-notifications` - Get user notifications
- `GET /notifications/unread` - Get unread notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/bulk-delete` - Delete multiple
- `GET /notifications/preferences` - Get preferences
- `PATCH /notifications/preferences` - Update preferences

### Social Action Endpoints
- `POST /social/posts/:id/like` - Toggle like
- `POST /comments` - Create comment (with @mention support)
- `POST /shares` - Create share
- `POST /friends/request` - Send friend request
- `POST /friends/accept/:id` - Accept friend request
- `POST /social/groups/:id/join` - Join group
- `POST /social/pages/:id/follow` - Follow page
- `POST /social/pages/:id/like` - Toggle page like

## Performance Considerations

- Notifications are sent asynchronously (don't block main operation)
- Bulk notifications processed in batches of 50
- WebSocket connections use socket.io rooms for efficient delivery
- Email sending queued to prevent blocking
- User preferences cached in memory after first fetch

## Security

- All notification endpoints require JWT authentication
- Users can only view their own notifications
- Resource ownership verified before notifications sent
- No sensitive data in notification messages
- Email templates sanitize user-generated content
