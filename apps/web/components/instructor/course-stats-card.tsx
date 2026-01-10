'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Star, DollarSign, Eye, BarChart } from 'lucide-react';
import type { CourseStats } from '@leap-lms/shared-types';
import { Link } from '@/i18n/navigation';

interface CourseStatsCardProps {
  course: CourseStats;
}

export function CourseStatsCard({ course }: CourseStatsCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Course Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{course.courseName}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} students</span>
              </div>
              {course.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Students</p>
            <p className="text-2xl font-bold">{course.activeStudents}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{course.completionRate.toFixed(0)}%</p>
          </div>

          {course.revenue > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold flex items-center">
                <DollarSign className="h-5 w-5" />
                {course.revenue.toFixed(2)}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Views</p>
            <p className="text-2xl font-bold">{course.viewCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Link href={`/hub/instructor/courses/${course.courseId}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Edit Course
            </Button>
          </Link>
          <Link href={`/hub/instructor/courses/${course.courseId}/analytics`}>
            <Button variant="outline" size="sm">
              <BarChart className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
