'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNotificationCount } from '@/lib/hooks/use-api';
import { NotificationPanel } from './notification-panel';
import { useState } from 'react';

/**
 * NotificationBell Component
 * Displays notification icon with unread count badge
 * 
 * RTL/LTR Support:
 * - Badge positioned with logical properties
 * - Popover aligns appropriately in both directions
 * 
 * Theme Support:
 * - Icon and badge colors adapt to theme
 * - Hover states visible in both themes
 * - Badge uses theme-aware colors
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: countData } = useNotificationCount();
  const unreadCount = countData?.count || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -end-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
