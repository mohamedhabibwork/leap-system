'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMarkNotificationAsRead, useDeleteNotification } from '@/lib/hooks/use-api';
import { formatDistanceToNow } from 'date-fns';
import { X, Circle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
    actor?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
  onClick?: () => void;
}

/**
 * NotificationItem Component
 * Individual notification item in the list
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Avatar and content flow correctly
 * - Actions positioned with logical properties
 * 
 * Theme Support:
 * - Background changes on hover (theme-aware)
 * - Unread indicator visible in both themes
 * - Text colors adapt to theme
 * - Avatar fallback uses theme colors
 */
export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!notification.isRead) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
      } catch (error) {
        // Error handled in mutation
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteMutation.mutateAsync(notification.id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getNotificationLink = () => {
    // Determine the link based on notification type and data
    const { type, data } = notification;
    
    if (!data) return '/hub/notifications';
    
    switch (type) {
      case 'post_reaction':
      case 'post_comment':
        return `/hub/social/post/${data.postId}`;
      case 'group_invitation':
      case 'group_joined':
        return `/hub/social/groups/${data.groupId}`;
      case 'event_reminder':
      case 'event_invitation':
        return `/hub/events/${data.eventId}`;
      case 'job_application_status':
        return `/hub/jobs/${data.jobId}`;
      case 'course_enrollment':
      case 'course_update':
        return `/hub/courses/${data.courseId}`;
      default:
        return '/hub/notifications';
    }
  };

  const link = getNotificationLink();

  return (
    <Link href={link} onClick={onClick}>
      <div
        className={`
          relative p-4 hover:bg-accent transition-colors cursor-pointer group
          ${!notification.isRead ? 'bg-primary/5' : ''}
        `}
        onClick={handleMarkAsRead}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {notification.actor ? (
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={notification.actor.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {notification.actor.name[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Circle className="w-5 h-5 text-primary" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 text-start">
            <p className="text-sm font-medium text-foreground mb-1">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMarkAsRead}
                title="Mark as read"
              >
                <Circle className="h-4 w-4 fill-primary text-primary" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
              title="Delete"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Unread Indicator */}
          {!notification.isRead && (
            <div className="absolute top-4 end-4 w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      </div>
    </Link>
  );
}
