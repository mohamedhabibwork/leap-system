import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonLockIconProps {
  canAccess: boolean;
  className?: string;
  size?: number;
}

export function LessonLockIcon({ canAccess, className, size = 20 }: LessonLockIconProps) {
  if (canAccess) {
    return (
      <Unlock
        className={cn('text-green-600 transition-all', className)}
        size={size}
      />
    );
  }

  return (
    <Lock
      className={cn('text-gray-400 transition-all', className)}
      size={size}
    />
  );
}
