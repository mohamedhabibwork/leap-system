'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BookOpen, User, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseShareCardProps {
  course: {
    id: number;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    instructor?: {
      id: number;
      name?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    instructorName?: string;
    price?: number;
    currency?: string;
    rating?: number;
    duration?: number;
    durationHours?: number;
    enrollmentCount?: number;
  };
  className?: string;
}

export function CourseShareCard({ course, className }: CourseShareCardProps) {
  if (!course) return null;

  const displayTitle = course.title || course.titleEn || 'Untitled Course';
  const displayDescription = course.description || course.descriptionEn || '';
  const thumbnail = course.thumbnail || course.thumbnailUrl;
  const instructorName =
    course.instructor?.name ||
    (course.instructor?.firstName && course.instructor?.lastName
      ? `${course.instructor.firstName} ${course.instructor.lastName}`
      : course.instructorName) ||
    'Unknown Instructor';
  const price = Number(course.price) || 0;
  const isFree = isNaN(price) || price === 0;
  const currency = course.currency || '$';
  const duration = course.duration || course.durationHours;

  return (
    <Card
      className={cn(
        'bg-muted/30 border-border/50 rounded-lg overflow-hidden',
        'hover:bg-muted/40 transition-colors group',
        className
      )}
    >
      <CardContent className="p-0">
        <Link
          href={`/hub/courses/${course.id}`}
          className="flex flex-col sm:flex-row"
        >
          {/* Course Thumbnail */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto sm:min-h-[120px] bg-muted flex-shrink-0">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={displayTitle}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/30" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-[15px] text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {displayTitle}
              </h3>
              {displayDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {displayDescription}
                </p>
              )}

              {/* Instructor Info */}
              <div className="flex items-center gap-2 mb-3">
                {course.instructor?.avatar && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback className="text-xs">
                      {instructorName[0]?.toUpperCase() || 'I'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {instructorName}
                </span>
              </div>

              {/* Course Meta */}
              <div className="flex items-center gap-3 flex-wrap">
                {course.rating && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                )}
                {duration && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{duration}h</span>
                  </div>
                )}
                {course.enrollmentCount && (
                  <div className="text-xs text-muted-foreground">
                    {course.enrollmentCount} students
                  </div>
                )}
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div>
                {isFree ? (
                  <Badge variant="secondary" className="text-xs">
                    Free
                  </Badge>
                ) : (
                  <span className="font-semibold text-foreground">
                    {currency}
                    {price.toFixed(2)}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                View Course
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
