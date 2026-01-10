'use client';

import { cn } from '@/lib/utils';

interface StoryRingProps {
  children: React.ReactNode;
  hasUnviewed?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * StoryRing Component
 * Gradient ring indicator around avatar for stories
 * 
 * RTL/LTR Support:
 * - Ring positioning works in both directions
 * - Gradient rotation is directionally neutral
 * 
 * Theme Support:
 * - Gradient colors adapt to theme
 * - Viewed state uses theme-aware colors
 */
export function StoryRing({ 
  children, 
  hasUnviewed = false, 
  size = 'medium',
  className 
}: StoryRingProps) {
  const sizeClasses = {
    small: 'p-[2px]',
    medium: 'p-[3px]',
    large: 'p-[3px]',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        hasUnviewed
          ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500'
          : 'bg-muted',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
