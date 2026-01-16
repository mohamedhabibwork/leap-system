'use client';

import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Volume2, VolumeX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotificationContext } from '@/lib/contexts/notification-context';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';

interface NotificationCenterProps {
  className?: string;
}

/**
 * NotificationCenter - Unified notification UI component for all users
 * 
 * Features:
 * - Real-time WebSocket notifications
 * - Mark as read (single/all)
 * - Delete notifications
 * - Filter by type
 * - Sound toggle
 * - Offline indicator
 * - Empty states
 * - Responsive design
 */
export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const router = useRouter();
  
  const {
    notifications,
    connected,
    unreadCount,
    soundEnabled,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
  } = useNotificationContext();

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    // Filter by type
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(n => {
        const notifType = n.type || '';
        return notifType.toLowerCase().includes(typeFilter.toLowerCase());
      });
    }

    return filtered;
  }, [notifications, filter, typeFilter]);

  // Get notification icon
  const getNotificationIcon = (notification: Notification) => {
    const type = notification.type || '';
    
    // Course/LMS notifications
    if (type.includes('course') || type.includes('assignment') || type.includes('quiz')) {
      return '🎓';
    }
    // Social notifications
    if (type.includes('comment') || type.includes('like') || type.includes('follow') || type.includes('mention')) {
      return '💬';
    }
    // Job notifications
    if (type.includes('job') || type.includes('interview') || type.includes('application')) {
      return '💼';
    }
    // Payment notifications
    if (type.includes('payment') || type.includes('subscription') || type.includes('refund')) {
      return '💳';
    }
    // Admin notifications
    if (type.includes('admin') || type.includes('ticket') || type.includes('report')) {
      return '⚙️';
    }
    // System notifications
    if (type.includes('system') || type.includes('maintenance') || type.includes('update')) {
      return '🔔';
    }
    
    return '📢';
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    const linkUrl = notification.linkUrl || getNotificationLink(notification);
    if (linkUrl) {
      router.push(linkUrl);
      setOpen(false);
    }
  };

  // Get notification link based on type
  const getNotificationLink = (notification: Notification): string | null => {
    const { type, data } = notification;
    
    if (!data) return null;
    
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
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!connected && (
            <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-gray-400" title="Offline" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {!connected && (
              <Badge variant="secondary" className="text-xs">
                Offline
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            {/* Mark all as read */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            
            {/* Clear all */}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="w-full rounded-none border-b grid grid-cols-2">
            <TabsTrigger value="all" className="rounded-none">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-none">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    {typeFilter !== 'all' ? 'No notifications of this type' : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                        !notification.isRead && 'bg-blue-50/50'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl shrink-0">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                typeof notification.createdAt === 'string' 
                                  ? new Date(notification.createdAt) 
                                  : notification.createdAt,
                                { addSuffix: true }
                              )}
                            </span>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <CheckCheck className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">No unread notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors bg-blue-50/50"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl shrink-0">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                typeof notification.createdAt === 'string' 
                                  ? new Date(notification.createdAt) 
                                  : notification.createdAt,
                                { addSuffix: true }
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
