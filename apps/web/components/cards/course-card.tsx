'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/courses/progress-ring';
import { Star, Users, Clock, PlayCircle, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { EnrollButton } from '@/components/buttons/enroll-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ShareButton } from '@/components/buttons/share-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    instructor: { id: number; name: string; avatar?: string };
    rating?: number;
    price: number;
    currency: string;
    level: string;
    duration?: number;
    enrollmentCount?: number;
    progress?: number;
    isEnrolled?: boolean;
    isFavorited?: boolean;
    lessonsCount?: number;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function CourseCard({ course, variant = 'grid', showActions = true }: CourseCardProps) {
  const isGrid = variant === 'grid';
  const t = useTranslations('courses.card');

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300',
      'hover:shadow-xl hover:-translate-y-1',
      isGrid ? '' : 'flex'
    )}>
      <Link href={`/hub/courses/${course.id}`} className={cn(
        'relative block overflow-hidden',
        isGrid ? '' : 'flex-shrink-0'
      )}>
        <div className="relative">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              width={isGrid ? 400 : 200}
              height={isGrid ? 200 : 150}
              className={cn(
                'object-cover transition-transform duration-300 group-hover:scale-105',
                isGrid ? 'w-full h-48' : 'w-48 h-full'
              )}
            />
          ) : (
            <div
              className={cn(
                'bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center',
                isGrid ? 'h-48 w-full' : 'w-48 h-full'
              )}
            >
              <BookOpen className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Hover Overlay with Play Icon */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white" />
          </div>

          {/* Instructor Avatar Overlay */}
          <div className="absolute bottom-2 start-2 flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-white shadow-lg">
              <AvatarImage src={course.instructor?.avatar} />
              <AvatarFallback className="text-xs">
                {course.instructor?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Progress Ring for Enrolled Courses */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="absolute top-2 end-2">
              <ProgressRing progress={course.progress} size="sm" />
            </div>
          )}

          {/* Continue Watching Badge */}
          {course.isEnrolled && course.progress !== undefined && course.progress > 0 && course.progress < 100 && (
            <div className="absolute top-2 start-2">
              <Badge className="bg-primary text-primary-foreground shadow-lg">
                {t('continueLearning')}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/hub/courses/${course.id}`} className="flex-1">
              <h3 className="font-bold text-lg line-clamp-2 hover:text-primary transition-colors leading-tight">
                {course.title}
              </h3>
            </Link>
            {showActions && (
              <FavoriteButton
                entityType="course"
                entityId={course.id}
                isFavorited={course.isFavorited}
                className="shrink-0"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {course.instructor?.name || 'Unknown Instructor'}
          </p>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="font-medium">
              {course.level}
            </Badge>
            {course.rating && (
              <Badge variant="outline" className="gap-1.5 font-medium">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {course.rating.toFixed(1)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {course.enrollmentCount !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {course.enrollmentCount.toLocaleString()}
                </span>
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{course.duration}h</span>
              </span>
            )}
            {course.lessonsCount && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">
                  {course.lessonsCount} {t('lessonsCount', { count: course.lessonsCount })}
                </span>
              </span>
            )}
          </div>

          {course.isEnrolled && course.progress !== undefined && (
            <div className="mt-4 p-3 bg-accent/50 rounded-lg border">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-semibold">{t('yourProgress', { defaultValue: 'Your Progress' })}</span>
                <span className="text-primary font-bold">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">
                {(() => {
                  const price = Number(course.price);
                  if (isNaN(price) || price === 0) {
                    return <Badge variant="secondary" className="text-base font-bold">{t('free')}</Badge>;
                  }
                  return `${course.currency || '$'}${price.toFixed(2)}`;
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton
                entityType="course"
                entityId={course.id}
                url={`/hub/courses/${course.id}`}
                title={course.title}
                variant="ghost"
                size="icon"
              />
              <EnrollButton
                courseId={course.id}
                price={course.price}
                enrollmentType={course.price === 0 ? 'free' : 'paid'}
                isEnrolled={course.isEnrolled}
                size="default"
              />
            </div>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
