'use client';

import { useNotificationContext } from '@/lib/contexts/notification-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCheck, Settings, Bell } from 'lucide-react';
import { NotificationItem } from './notification-item';
import { Link } from '@/i18n/navigation';

interface NotificationPanelProps {
  onClose?: () => void;
}

/**
 * NotificationPanel Component
 * Displays list of notifications in a dropdown panel
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Scroll area works correctly in both directions
 * - Actions positioned with logical properties
 * 
 * Theme Support:
 * - Background and text colors adapt to theme
 * - Borders and separators use theme colors
 * - Empty state visible in both themes
 */
export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    loading: isLoading,
    markAllAsRead 
  } = useNotificationContext();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-start">Notifications</h3>
          <Link href="/hub/notifications">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground text-start">
              {unreadCount} unread
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-1">No notifications</h4>
            <p className="text-sm text-muted-foreground">
              We'll notify you when something new happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification: any) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <Link href="/hub/notifications" className="block">
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary"
                onClick={onClose}
              >
                View all notifications
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
