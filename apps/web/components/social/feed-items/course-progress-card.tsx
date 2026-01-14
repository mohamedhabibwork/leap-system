'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Play, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CourseProgressCardProps {
  userId: number;
  userName: string;
  userAvatar?: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  updatedAt: string;
  isCompleted?: boolean;
}

export function CourseProgressCard({
  userId,
  userName,
  userAvatar,
  courseId,
  courseTitle,
  courseThumbnail,
  progress,
  completedLessons,
  totalLessons,
  updatedAt,
  isCompleted = false,
}: CourseProgressCardProps) {
  const t = useTranslations('learning.feed');

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Link href={`/hub/users/${userId}`}>
            <Avatar className="hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link
              href={`/hub/users/${userId}`}
              className="font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              {userName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <BookOpen className="h-4 w-4" />
              {isCompleted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t('completedCourse')}
                </span>
              ) : (
                <span>{t('progressUpdate')}</span>
              )}
              <span>•</span>
              <span>{formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Link href={`/hub/courses/${courseId}`} className="block group">
          <div className="flex gap-4">
            {/* Course Thumbnail */}
            <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden relative">
              {courseThumbnail ? (
                <img 
                  src={courseThumbnail} 
                  alt={courseTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white/80" />
                </div>
              )}
              {isCompleted && (
                <div className="absolute inset-0 bg-green-600/90 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {courseTitle}
              </h3>

              <div className="mt-3 space-y-2">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {completedLessons} / {totalLessons} {t('lessonsCompleted')}
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  {isCompleted ? (
                    <>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        {t('completed')}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/hub/courses/${courseId}/certificate`}>
                          {t('viewCertificate')}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href={`/hub/courses/${courseId}/learn`}>
                        <Play className="h-4 w-4 me-2" />
                        {t('continueJLearning')}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
