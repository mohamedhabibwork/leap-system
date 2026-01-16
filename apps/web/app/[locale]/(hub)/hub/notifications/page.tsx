'use client';

import { useNotifications, useMarkAllNotificationsAsRead, useDeleteAllNotifications } from '@/lib/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from '@/components/notifications/notification-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Trash2, Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Notifications Page
 * Full-page view of all notifications
 * 
 * RTL/LTR Support:
 * - All content flows correctly in both directions
 * - Tabs and buttons positioned properly
 * 
 * Theme Support:
 * - Cards and content adapt to theme
 * - All text visible in both themes
 */
import { useTranslations } from 'next-intl';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const { data: notificationsData, isLoading } = useNotifications({ limit: 50 });
  
  // ...

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" />
            {t('title')}
          </h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground mt-2 text-start">
              {t('unreadCount', { count: unreadCount })}
            </p>
          )}
        </div>

        <Link href="/hub/notifications/settings">
          <Button variant="outline" size="icon" title={t('settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {t('markAllAsRead')}
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t('clearAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-start">{t('clearAllTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="text-start">
                  {t('clearAllDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('tabs.cancel', { defaultValue: 'Cancel' })}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAllMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('deleteAll')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {t('tabs.all')} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t('tabs.unread')} ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0">
          {isLoading ? (
            <Card>
              <CardContent className="p-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-border last:border-0">
                    <div className="flex gap-3 animate-pulse">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('noNotifications')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('noNotificationsDesc')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {notifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-0">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('allCaughtUp')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('noUnread')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {unreadNotifications.map((notification: any) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
