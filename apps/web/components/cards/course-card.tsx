'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Clock } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { EnrollButton } from '@/components/buttons/enroll-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ShareButton } from '@/components/buttons/share-button';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    instructor: { id: number; name: string };
    rating?: number;
    price: number;
    currency: string;
    level: string;
    duration?: number;
    enrollmentCount?: number;
    progress?: number;
    isEnrolled?: boolean;
    isFavorited?: boolean;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function CourseCard({ course, variant = 'grid', showActions = true }: CourseCardProps) {
  const isGrid = variant === 'grid';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex'}`}>
      <Link href={`/hub/courses/${course.id}`} className={isGrid ? '' : 'flex-shrink-0'}>
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={isGrid ? 400 : 200}
            height={isGrid ? 200 : 150}
            className={`object-cover ${isGrid ? 'w-full h-48' : 'w-48 h-full'} rounded-t-lg`}
          />
        ) : (
          <div
            className={`bg-gradient-to-br from-primary/20 to-primary/5 ${
              isGrid ? 'h-48' : 'w-48'
            } flex items-center justify-center`}
          >
            <span className="text-4xl">📚</span>
          </div>
        )}
      </Link>

      <div className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/hub/courses/${course.id}`} className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary">
                {course.title}
              </h3>
            </Link>
            {showActions && (
              <FavoriteButton
                entityType="course"
                entityId={course.id}
                isFavorited={course.isFavorited}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">by {course.instructor.name}</p>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {course.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary">{course.level}</Badge>
            {course.rating && (
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {course.enrollmentCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course.enrollmentCount}
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}h
              </span>
            )}
          </div>

          {course.isEnrolled && course.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {course.price === 0
                  ? 'Free'
                  : `${course.currency} ${course.price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton
                entityType="course"
                entityId={course.id}
                url={`/hub/courses/${course.id}`}
                title={course.title}
              />
              <EnrollButton
                courseId={course.id}
                price={course.price}
                enrollmentType="paid"
                isEnrolled={course.isEnrolled}
              />
            </div>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
