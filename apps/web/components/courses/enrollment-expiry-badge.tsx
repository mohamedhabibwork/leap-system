import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Infinity } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface EnrollmentExpiryBadgeProps {
  expiresAt?: Date;
  enrollmentType?: string;
  showCountdown?: boolean;
  showDate?: boolean;
  className?: string;
}

export function EnrollmentExpiryBadge({
  expiresAt,
  enrollmentType = 'Standard',
  showCountdown = true,
  showDate = true,
  className,
}: EnrollmentExpiryBadgeProps) {
  // Lifetime access
  if (!expiresAt) {
    return (
      <Badge variant="outline" className={cn('bg-purple-50 text-purple-700 border-purple-200', className)}>
        <Infinity className="h-3 w-3 mr-1" />
        Lifetime Access
      </Badge>
    );
  }

  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysRemaining = differenceInDays(expiryDate, now);

  // Determine color based on days remaining
  const getVariantClass = () => {
    if (daysRemaining < 0) {
      return 'bg-red-100 text-red-700 border-red-300';
    } else if (daysRemaining <= 7) {
      return 'bg-red-50 text-red-700 border-red-200';
    } else if (daysRemaining <= 30) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    return 'bg-green-50 text-green-700 border-green-200';
  };

  // Expired
  if (daysRemaining < 0) {
    return (
      <Badge variant="outline" className={cn(getVariantClass(), className)}>
        <Clock className="h-3 w-3 mr-1" />
        Expired
      </Badge>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {showCountdown && (
        <Badge variant="outline" className={getVariantClass()}>
          <Clock className="h-3 w-3 mr-1" />
          Expires {formatDistanceToNow(expiryDate, { addSuffix: true })}
        </Badge>
      )}
      {showDate && (
        <Badge variant="outline" className={cn('text-xs', getVariantClass())}>
          <Calendar className="h-3 w-3 mr-1" />
          Until {format(expiryDate, 'MMM dd, yyyy')}
        </Badge>
      )}
    </div>
  );
}
