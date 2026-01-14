'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, Star, Sparkles } from 'lucide-react';

interface CourseRecommendationCardProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail?: string;
  instructorName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  enrolledCount: number;
  rating: number;
  reasonForRecommendation: string;
}

export function CourseRecommendationCard({
  courseId,
  courseTitle,
  courseDescription,
  courseThumbnail,
  instructorName,
  level,
  duration,
  enrolledCount,
  rating,
  reasonForRecommendation,
}: CourseRecommendationCardProps) {
  const t = useTranslations('learning.feed');

  const getLevelColor = () => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">{t('recommendedForYou')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {reasonForRecommendation}
        </p>
      </CardHeader>

      <CardContent>
        <Link href={`/hub/courses/${courseId}`} className="block group">
          <div className="space-y-4">
            {/* Course Thumbnail */}
            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden relative">
              {courseThumbnail ? (
                <img 
                  src={courseThumbnail} 
                  alt={courseTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                {courseTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {courseDescription}
              </p>

              <p className="text-sm text-muted-foreground mt-2">
                {t('by')} <span className="font-medium">{instructorName}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge className={getLevelColor()}>
                {level}
              </Badge>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{enrolledCount.toLocaleString()} {t('enrolled')}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full">
          <Link href={`/hub/courses/${courseId}`}>
            {t('viewCourse')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
