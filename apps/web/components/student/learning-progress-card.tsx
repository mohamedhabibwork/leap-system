'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, PlayCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { StudentCourseProgress } from '@leap-lms/shared-types';

interface LearningProgressCardProps {
  course: StudentCourseProgress;
}

export function LearningProgressCard({ course }: LearningProgressCardProps) {
  const isExpiringSoon = 
    course.enrollmentExpiry && 
    !course.enrollmentExpiry.isExpired && 
    course.enrollmentExpiry.daysRemaining !== undefined && 
    course.enrollmentExpiry.daysRemaining < 7;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {course.thumbnailUrl && (
            <div className="relative w-full h-40 bg-muted">
              <Image
                src={course.thumbnailUrl}
                alt={course.courseName}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
          )}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{course.courseName}</h3>
              <p className="text-sm text-muted-foreground">{course.instructorName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={course.progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {course.completedLessons} of {course.totalLessons} lessons completed
              </p>
            </div>

            {isExpiringSoon && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-2">
                <p className="text-xs text-orange-700">
                  Expires in {course.enrollmentExpiry!.daysRemaining} days
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {course.nextLesson ? (
                <Link href={`/hub/courses/${course.courseId}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Link href={`/hub/courses/${course.courseId}`} className="flex-1">
                  <Button className="w-full" size="sm" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
