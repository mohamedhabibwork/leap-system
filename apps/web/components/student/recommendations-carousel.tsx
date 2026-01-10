'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { CourseRecommendation } from '@leap-lms/shared-types';

interface RecommendationsCarouselProps {
  recommendations: CourseRecommendation[];
}

const reasonIcons = {
  similar_category: Sparkles,
  popular: Users,
  trending: TrendingUp,
  instructor: Star,
};

const reasonLabels = {
  similar_category: 'Similar to your courses',
  popular: 'Popular choice',
  trending: 'Trending now',
  instructor: 'From instructors you follow',
};

export function RecommendationsCarousel({ recommendations }: RecommendationsCarouselProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Courses you might like based on your interests</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recommendations available yet. Enroll in more courses to get personalized suggestions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((course) => {
              const ReasonIcon = reasonIcons[course.reason];
              
              return (
                <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {course.thumbnailUrl ? (
                        <div className="relative w-full h-32 bg-muted">
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.courseName}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg" />
                      )}
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <ReasonIcon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2">{course.courseName}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{course.instructorName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{course.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {course.enrollmentCount} students
                          </span>
                        </div>

                        <Badge variant="secondary" className="text-xs w-fit">
                          {reasonLabels[course.reason]}
                        </Badge>

                        <Link href={`/hub/courses/${course.courseId}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            View Course
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {recommendations.length > 6 && (
          <div className="mt-4 text-center">
            <Link href="/hub/courses">
              <Button variant="outline">
                View All Recommendations
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
