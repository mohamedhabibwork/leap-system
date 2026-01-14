'use client';

import { cn } from '@/lib/utils';
import { useIsUserOnline } from '@/lib/hooks/use-presence';

interface OnlineIndicatorProps {
  userId?: number;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

/**
 * Online status indicator dot
 * Can use either direct `isOnline` prop or fetch from presence store using `userId`
 */
export function OnlineIndicator({ 
  userId, 
  isOnline: propIsOnline,
  size = 'md',
  className,
  showLabel = false,
}: OnlineIndicatorProps) {
  const storeIsOnline = useIsUserOnline(userId);
  const isOnline = propIsOnline !== undefined ? propIsOnline : storeIsOnline;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span 
        className={cn(
          'rounded-full',
          sizeClasses[size],
          isOnline 
            ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' 
            : 'bg-gray-400'
        )}
        aria-label={isOnline ? 'Online' : 'Offline'}
      />
      {showLabel && (
        <span className={cn(
          'text-xs',
          isOnline ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}

/**
 * Absolute positioned online indicator for avatars
 */
export function AvatarOnlineIndicator({ 
  userId,
  isOnline: propIsOnline,
  size = 'md',
  className,
}: OnlineIndicatorProps) {
  const storeIsOnline = useIsUserOnline(userId);
  const isOnline = propIsOnline !== undefined ? propIsOnline : storeIsOnline;

  const sizeClasses = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 bottom-0 right-0',
    lg: 'w-3.5 h-3.5 bottom-0 right-0',
  };

  return (
    <span 
      className={cn(
        'absolute rounded-full border-2 border-background',
        sizeClasses[size],
        isOnline 
          ? 'bg-green-500' 
          : 'bg-gray-400',
        className
      )}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  );
}
