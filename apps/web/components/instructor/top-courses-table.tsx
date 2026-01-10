'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Star, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CourseStats } from '@leap-lms/shared-types';

interface TopCoursesTableProps {
  courses: CourseStats[];
}

export function TopCoursesTable({ courses }: TopCoursesTableProps) {
  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Courses
          </CardTitle>
          <CardDescription>Your best courses by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No courses available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performing Courses
        </CardTitle>
        <CardDescription>Your best courses by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.courseId}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                index === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : index === 1
                  ? 'bg-gray-200 text-gray-700'
                  : index === 2
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {index + 1}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm truncate">{course.courseName}</h4>
                  {course.isFeatured && (
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course.enrollmentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{course.completionRate.toFixed(0)}% completion</span>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign className="h-4 w-4" />
                  <span>{course.revenue.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">revenue</p>
              </div>

              {/* Actions */}
              <Link href={`/hub/instructor/courses/${course.courseId}/analytics`}>
                <Button size="sm" variant="ghost">
                  View Analytics
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {courses.length >= 5 && (
          <div className="mt-4 text-center">
            <Link href="/hub/instructor/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
