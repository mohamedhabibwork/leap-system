'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/courses/progress-ring';
import { Star, Users, Clock, PlayCircle, BookOpen, Award, TrendingUp, Heart } from 'lucide-react';
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
    titleEn?: string;
    titleAr?: string;
    description: string;
    descriptionEn?: string;
    descriptionAr?: string;
    thumbnail?: string;
    instructor?: { id: number; name: string; avatar?: string };
    instructorName?: string;
    rating?: number;
    price: number;
    currency?: string;
    level: string;
    duration?: number;
    enrollmentCount?: number;
    progress?: number;
    isEnrolled?: boolean;
    isFavorited?: boolean;
    lessonsCount?: number;
    isFeatured?: boolean;
    viewCount?: number;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function CourseCard({ course, variant = 'grid', showActions = true }: CourseCardProps) {
  const isGrid = variant === 'grid';
  const t = useTranslations('courses.card');
  
  const displayTitle = course.title || course.titleEn || '';
  const displayDescription = course.description || course.descriptionEn || '';
  const instructorName = course.instructor?.name || course.instructorName || 'Unknown Instructor';
  const price = Number(course.price) || 0;
  const isFree = isNaN(price) || price === 0;
  const currency = course.currency || '$';

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300',
      'hover:shadow-2xl hover:-translate-y-2 border-2 hover:border-primary/20',
      'bg-card',
      isGrid ? 'flex flex-col' : 'flex flex-row'
    )}>
      {/* Image Section */}
      <Link 
        href={`/hub/courses/${course.id}`} 
        className={cn(
          'relative block overflow-hidden bg-muted',
          isGrid ? 'w-full aspect-video' : 'w-64 shrink-0'
        )}
      >
        <div className="relative w-full h-full">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes={isGrid ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : '256px'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-primary/30" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/30">
              <PlayCircle className="w-12 h-12 text-white" fill="currentColor" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-2 z-10">
            {course.isEnrolled && course.progress !== undefined && course.progress > 0 && course.progress < 100 && (
              <Badge className="bg-primary text-primary-foreground shadow-lg border-0">
                <Clock className="w-3 h-3 me-1" />
                {t('continueLearning')}
              </Badge>
            )}
            {course.isFeatured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Award className="w-3 h-3 me-1" />
                {t('bestseller', { defaultValue: 'Featured' })}
              </Badge>
            )}
          </div>

          {/* Progress Ring for Enrolled Courses */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="absolute top-3 end-3 z-10">
              <div className="bg-background/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
                <ProgressRing progress={course.progress} size="sm" />
              </div>
            </div>
          )}

          {/* Instructor Avatar */}
          <div className="absolute bottom-3 start-3 z-10">
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
              <Avatar className="w-6 h-6 border-2 border-white">
                <AvatarImage src={course.instructor?.avatar} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {instructorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground pr-1 max-w-[100px] truncate">
                  {instructorName}
                </span>
            </div>
          </div>

          {/* View Count Badge */}
          {course.viewCount !== undefined && course.viewCount > 0 && (
            <div className="absolute bottom-3 end-3 z-10">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-0 shadow-lg">
                <TrendingUp className="w-3 h-3 me-1" />
                {course.viewCount.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/hub/courses/${course.id}`} className="flex-1 group/title">
              <h3 className="font-bold text-lg sm:text-xl line-clamp-2 group-hover/title:text-primary transition-colors leading-tight">
                {displayTitle}
              </h3>
            </Link>
            {showActions && (
              <FavoriteButton
                entityType="course"
                entityId={course.id}
                isFavorited={course.isFavorited}
                className="shrink-0 mt-1"
                size="sm"
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 pb-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium text-xs">
              {course.level}
            </Badge>
            {course.rating && course.rating > 0 && (
              <Badge variant="outline" className="gap-1.5 font-medium text-xs border-yellow-500/30">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span>{course.rating.toFixed(1)}</span>
              </Badge>
            )}
            {isFree && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-0">
                {t('free')}
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {course.enrollmentCount !== undefined && course.enrollmentCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {course.enrollmentCount.toLocaleString()}
                </span>
              </span>
            )}
            {course.duration && course.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{course.duration}h</span>
              </span>
            )}
            {course.lessonsCount && course.lessonsCount > 0 && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">
                  {course.lessonsCount} {t('lessonsCount', { count: course.lessonsCount })}
                </span>
              </span>
            )}
          </div>

          {/* Progress Section for Enrolled Courses */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-semibold text-foreground">
                  {t('yourProgress')}
                </span>
                <span className="text-primary font-bold">{Math.round(course.progress)}%</span>
              </div>
              <Progress 
                value={course.progress} 
                className="h-2 bg-background/50"
              />
            </div>
          )}
        </CardContent>

        {/* Footer with Price and Actions */}
        {showActions && (
          <CardFooter className="flex items-center justify-between pt-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              {isFree ? (
                <Badge variant="secondary" className="text-base font-bold px-3 py-1.5">
                  {t('free')}
                </Badge>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">
                    {currency}{price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShareButton
                entityType="course"
                entityId={course.id}
                url={`/hub/courses/${course.id}`}
                title={displayTitle}
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              />
              <EnrollButton
                courseId={course.id}
                price={course.price}
                enrollmentType={isFree ? 'free' : 'paid'}
                isEnrolled={course.isEnrolled}
                size="default"
                className="h-9"
              />
            </div>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
