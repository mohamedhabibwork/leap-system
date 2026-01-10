# Notifications System Documentation

## Overview

The LEAP PM notification system is a comprehensive multi-channel notification infrastructure that supports:
- **50 notification types** across 6 categories (LMS, Jobs, Social, Tickets, Payments, System)
- **3 delivery channels**: Database (in-app), Email (SMTP), FCM (push notifications)
- **Real-time delivery** via WebSocket
- **Bilingual support** (English/Arabic)
- **User preferences** for notification management

## Architecture

```
Event Trigger → NotificationsService → [Database, Email, FCM, WebSocket]
                                     ↓
                               User's Device/Inbox
```

## Quick Start

### 1. Sending a Notification

```typescript
import { NotificationsService } from './notifications/notifications.service';

// Inject the service
constructor(private notificationsService: NotificationsService) {}

// Send multi-channel notification
await this.notificationsService.sendMultiChannelNotification({
  userId: 123,
  notificationTypeId: 1, // course_enrollment
  title: 'Welcome to Your New Course!',
  message: 'You have been enrolled in TypeScript Basics',
  linkUrl: '/courses/typescript-basics',
  channels: ['database', 'email', 'fcm', 'websocket'],
  emailData: {
    templateMethod: 'sendCourseEnrollmentEmail',
    data: {
      userName: 'John Doe',
      courseName: 'TypeScript Basics',
      courseUrl: 'https://leap-lms.com/courses/typescript-basics',
      instructorName: 'Jane Smith',
    },
  },
});
```

### 2. Sending Bulk Notifications

```typescript
// Send to multiple users
await this.notificationsService.sendBulkNotifications({
  userIds: [1, 2, 3, 4, 5],
  notificationTypeId: 10,
  title: 'New Feature Announcement',
  message: 'Check out our new course recommendation engine!',
  channels: ['database', 'websocket'],
});
```

### 3. Sending to a Role

```typescript
// Send to all admins
await this.notificationsService.sendNotificationToRole('admin', {
  notificationTypeId: 31,
  title: 'New Support Ticket',
  message: 'A new support ticket requires attention',
  linkUrl: '/admin/tickets/456',
  channels: ['database', 'websocket', 'email'],
});
```

## Notification Types

### LMS Notifications (12 types)
1. `course_enrollment` - User enrolled in course
2. `course_enrollment_approved` - Enrollment approved
3. `course_completion` - Course completed
4. `lesson_unlocked` - New lesson available
5. `assignment_assigned` - New assignment
6. `assignment_submitted` - Assignment submitted
7. `assignment_graded` - Assignment graded
8. `assignment_due_soon` - Assignment due in 24 hours
9. `quiz_graded` - Quiz results available
10. `certificate_issued` - Certificate earned
11. `instructor_message` - Message from instructor
12. `course_updated` - Course content updated

### Job Notifications (8 types)
13. `job_posted` - New job matching criteria
14. `job_application_received` - Application received
15. `job_application_reviewed` - Application under review
16. `job_application_shortlisted` - Shortlisted for interview
17. `job_interview_scheduled` - Interview scheduled
18. `job_application_accepted` - Application accepted
19. `job_application_rejected` - Application rejected
20. `job_expired` - Job posting expired

### Social Notifications (10 types)
21. `friend_request_received` - Friend request received
22. `friend_request_accepted` - Friend request accepted
23. `group_invitation` - Invited to group
24. `group_joined` - User joined your group
25. `post_commented` - Comment on your post
26. `post_reaction` - Reaction to your post
27. `comment_reply` - Reply to your comment
28. `mention_in_post` - Mentioned in post
29. `event_invitation` - Event invitation
30. `event_reminder` - Event starts soon

### Ticket Notifications (6 types)
31. `ticket_created` - Support ticket created
32. `ticket_assigned` - Ticket assigned to agent
33. `ticket_reply` - New reply to ticket
34. `ticket_status_changed` - Ticket status updated
35. `ticket_resolved` - Ticket resolved
36. `ticket_reopened` - Ticket reopened

### Payment Notifications (6 types)
37. `payment_successful` - Payment processed
38. `payment_failed` - Payment failed
39. `refund_processed` - Refund issued
40. `subscription_renewed` - Subscription renewed
41. `subscription_expiring` - Subscription expires soon
42. `subscription_cancelled` - Subscription cancelled

### System Notifications (8 types)
43. `account_verified` - Email verified
44. `password_changed` - Password changed
45. `security_alert` - Unusual login detected
46. `profile_updated` - Profile updated
47. `maintenance_scheduled` - System maintenance
48. `welcome_to_platform` - New user welcome
49. `inactivity_reminder` - Inactive for 30 days
50. `account_suspended` - Account suspended

## Email Templates

All email templates are located in `templates/` directory:

```
templates/
├── base.template.ts          # Base HTML template
├── lms/                      # 12 LMS templates
├── jobs/                     # 8 job templates
├── social/                   # 10 social templates
├── tickets/                  # 6 ticket templates
├── payments/                 # 6 payment templates
└── system/                   # 8 system templates
```

### Using Email Templates

```typescript
import { EmailService } from './email.service';

constructor(private emailService: EmailService) {}

// Send course enrollment email
await this.emailService.sendCourseEnrollmentEmail(
  'user@example.com',
  {
    userName: 'John Doe',
    courseName: 'TypeScript Basics',
    courseUrl: 'https://leap-lms.com/courses/typescript-basics',
    instructorName: 'Jane Smith',
    startDate: '2026-01-15',
  }
);
```

## Multi-Channel Delivery

### Channels

1. **Database** - Stored notifications (always enabled)
2. **WebSocket** - Real-time delivery
3. **Email** - HTML email via SMTP
4. **FCM** - Push notifications (mobile/web)

### Channel Selection

```typescript
// Send to all channels
channels: ['database', 'email', 'fcm', 'websocket']

// Only in-app and real-time
channels: ['database', 'websocket']

// Email only
channels: ['email']
```

## FCM (Push Notifications)

### Rich Notifications

```typescript
import { FCMService } from './fcm.service';

await this.fcmService.sendRichNotification(
  'user-fcm-token',
  {
    title: 'New Message',
    body: 'You have a new message from Jane',
    imageUrl: 'https://example.com/image.jpg',
    icon: '/icons/message.png',
    clickAction: 'https://leap-lms.com/messages/123',
    color: '#4f46e5',
    data: {
      messageId: '123',
      senderId: '456',
    },
  }
);
```

### Topic Subscriptions

```typescript
// Subscribe users to topics
await this.fcmService.subscribeToTopic(
  ['token1', 'token2'],
  'course-updates'
);

// Send to topic
await this.fcmService.sendToTopic(
  'course-updates',
  'New Course Available',
  'Check out Advanced React Patterns'
);
```

## User Preferences

### Default Preferences

All notifications are enabled by default. Users can customize:
- Email notifications (on/off per category)
- Push notifications (on/off per category)
- Notification categories: LMS, Jobs, Social, Tickets, Payments, System

### Checking Preferences

```typescript
const preferences = await this.notificationsService.getUserNotificationPreferences(userId);

if (preferences.emailEnabled && preferences.categories.lms.email) {
  // Send email notification for LMS category
}
```

## Integration Examples

### LMS Service Integration

```typescript
// enrollments.service.ts
import { NotificationsService } from '../notifications/notifications.service';

async create(createEnrollmentDto: CreateEnrollmentDto) {
  const [enrollment] = await this.db.insert(enrollments)
    .values(createEnrollmentDto as any)
    .returning();
  
  // Send notification
  await this.notificationsService.sendMultiChannelNotification({
    userId: enrollment.userId,
    notificationTypeId: 1, // course_enrollment
    title: 'Welcome to Your New Course!',
    message: `You have been enrolled in ${course.name}`,
    linkUrl: `/courses/${enrollment.courseId}`,
    channels: ['database', 'email', 'websocket'],
    emailData: {
      templateMethod: 'sendCourseEnrollmentEmail',
      data: {
        userName: user.firstName,
        courseName: course.name,
        courseUrl: `${FRONTEND_URL}/courses/${course.id}`,
        instructorName: instructor.name,
      },
    },
  });
  
  return enrollment;
}
```

### Job Application Integration

```typescript
// jobs.service.ts
async applyForJob(jobId: number, userId: number, applicationData: any) {
  // Create application...
  
  // Notify applicant
  await this.notificationsService.sendMultiChannelNotification({
    userId,
    notificationTypeId: 14, // job_application_received
    title: 'Application Received!',
    message: `Your application for ${job.title} has been received`,
    linkUrl: `/jobs/${jobId}/applications`,
    channels: ['database', 'email', 'websocket'],
    emailData: {
      templateMethod: 'sendJobApplicationReceivedEmail',
      data: {
        userName: user.firstName,
        jobTitle: job.title,
        companyName: company.name,
        appliedAt: new Date().toLocaleString(),
        applicationUrl: `${FRONTEND_URL}/jobs/${jobId}/applications`,
      },
    },
  });
}
```

### Social Service Integration

```typescript
// posts.service.ts
async createComment(postId: number, userId: number, comment: string) {
  // Create comment...
  
  // Notify post owner
  await this.notificationsService.sendMultiChannelNotification({
    userId: post.userId,
    notificationTypeId: 25, // post_commented
    title: 'New Comment on Your Post',
    message: `${commenter.name} commented on your post`,
    linkUrl: `/posts/${postId}`,
    channels: ['database', 'websocket'], // No email for social by default
    emailData: {
      templateMethod: 'sendPostCommentedEmail',
      data: {
        userName: postOwner.firstName,
        commenterName: commenter.name,
        postUrl: `${FRONTEND_URL}/posts/${postId}`,
        commentPreview: comment.substring(0, 100),
        postTitle: post.title,
      },
    },
  });
}
```

## WebSocket Real-Time Notifications

The system uses Socket.IO for real-time notifications:

```typescript
// Client-side (frontend)
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications');

// Subscribe to user notifications
socket.emit('subscribe', { userId: 123, roles: ['user'] });

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Show toast, update UI, etc.
});
```

## API Endpoints

### GET /notifications
Get user's notifications
```typescript
// Query params: page, limit, unread
```

### GET /notifications/unread
Get unread notifications count

### PATCH /notifications/:id/read
Mark notification as read

### PATCH /notifications/read-all
Mark all as read

### DELETE /notifications/:id
Delete notification

### GET /notifications/statistics
Get notification statistics

## Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@habib.cloud
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@habib.cloud
FROM_NAME=LEAP PM

# Firebase/FCM Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Frontend URL for email links
FRONTEND_URL=https://leap-lms.com
```

## Testing

### Manual Testing

```bash
# Send test notification
curl -X POST http://localhost:3000/api/notifications/test \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": 1,
    "type": "course_enrollment",
    "channels": ["database", "email"]
  }'
```

### Unit Tests

```typescript
describe('NotificationsService', () => {
  it('should send multi-channel notification', async () => {
    await service.sendMultiChannelNotification({
      userId: 1,
      notificationTypeId: 1,
      title: 'Test',
      message: 'Test message',
      channels: ['database'],
    });
    
    expect(dbInsertSpy).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Always provide meaningful titles and messages**
   - Title: Short, clear summary
   - Message: Detailed context

2. **Include action URLs**
   - Link to relevant page/resource
   - Use absolute URLs for emails

3. **Choose appropriate channels**
   - Critical: All channels
   - Social: Database + WebSocket only
   - Transactional: Database + Email

4. **Respect user preferences**
   - Check before sending email/push
   - Provide unsubscribe options

5. **Handle errors gracefully**
   - Log failures
   - Don't block on notification failures
   - Implement retry logic

6. **Use bulk operations for efficiency**
   - Batch notifications when possible
   - Use topics for broadcast messages

7. **Monitor delivery rates**
   - Track sent/failed notifications
   - Monitor email bounce rates
   - Check FCM token validity

## Troubleshooting

### Emails not sending
- Check SMTP configuration
- Verify credentials
- Check spam folder
- Review email service logs

### Push notifications not working
- Verify Firebase configuration
- Check FCM token validity
- Ensure device registered
- Review FCM service logs

### WebSocket not connecting
- Check Socket.IO server
- Verify CORS settings
- Check client configuration

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] Slack/Discord webhooks
- [ ] Notification templates editor (admin UI)
- [ ] A/B testing for notifications
- [ ] Analytics dashboard
- [ ] Delivery rate optimization
- [ ] Smart notification batching
- [ ] User notification preferences UI

## Support

For questions or issues:
- Check logs: `apps/backend/logs/`
- Review database: `notifications` table
- Contact: dev@habib.cloud
