import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Crown, GraduationCap, Shield } from 'lucide-react';

interface LessonAccessBadgeProps {
  isPreview: boolean;
  canAccess: boolean;
  accessReason?: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
  showIcon?: boolean;
}

export function LessonAccessBadge({
  isPreview,
  canAccess,
  accessReason,
  showIcon = true,
}: LessonAccessBadgeProps) {
  // Free Preview
  if (isPreview) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {showIcon && <Unlock className="h-3 w-3 mr-1" />}
        Free Preview
      </Badge>
    );
  }

  // Admin Access
  if (accessReason === 'admin') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        {showIcon && <Shield className="h-3 w-3 mr-1" />}
        Admin Access
      </Badge>
    );
  }

  // Instructor Access
  if (accessReason === 'instructor') {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        {showIcon && <GraduationCap className="h-3 w-3 mr-1" />}
        Instructor Access
      </Badge>
    );
  }

  // Enrolled
  if (canAccess && accessReason === 'enrolled') {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {showIcon && <Unlock className="h-3 w-3 mr-1" />}
        Enrolled
      </Badge>
    );
  }

  // Locked (no access)
  if (!canAccess) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        {showIcon && <Lock className="h-3 w-3 mr-1" />}
        Premium
      </Badge>
    );
  }

  return null;
}
