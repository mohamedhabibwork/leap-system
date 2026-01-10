import { Card } from '@/components/ui/card';
import { LessonAccessBadge } from '@/components/courses/lesson-access-badge';
import { LessonLockIcon } from '@/components/courses/lesson-lock-icon';
import { PlayCircle, FileText, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { Lesson } from '@leap-lms/shared-types';

interface LessonCardProps {
  lesson: Lesson;
  courseId: number;
  onClick?: () => void;
  showBadge?: boolean;
  variant?: 'default' | 'compact';
}

export function LessonCard({
  lesson,
  courseId,
  onClick,
  showBadge = true,
  variant = 'default',
}: LessonCardProps) {
  const canAccess = lesson.canAccess ?? lesson.isPreview;

  const content = (
    <Card
      className={cn(
        'transition-all',
        canAccess ? 'hover:shadow-md cursor-pointer' : 'opacity-70',
        variant === 'compact' ? 'p-3' : 'p-4'
      )}
      onClick={canAccess ? onClick : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <LessonLockIcon canAccess={canAccess} size={variant === 'compact' ? 16 : 20} />
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                'font-semibold',
                variant === 'compact' ? 'text-sm' : 'text-base',
                canAccess ? 'hover:text-primary' : 'text-gray-600'
              )}
            >
              {lesson.titleEn}
            </h4>
            {lesson.descriptionEn && variant === 'default' && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {lesson.descriptionEn}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {lesson.videoUrl && (
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" />
                  Video
                </span>
              )}
              {!lesson.videoUrl && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Text
                </span>
              )}
              {lesson.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.durationMinutes} min
                </span>
              )}
            </div>
          </div>
        </div>
        {showBadge && (
          <LessonAccessBadge
            isPreview={lesson.isPreview}
            canAccess={canAccess}
            accessReason={lesson.accessReason}
            showIcon={false}
          />
        )}
      </div>
    </Card>
  );

  if (canAccess) {
    return (
      <Link href={`/hub/courses/${courseId}/lessons/${lesson.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
