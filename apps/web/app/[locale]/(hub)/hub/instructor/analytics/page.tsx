'use client';

import { useState } from 'react';
import { useInstructorCourses, useCourseAnalytics } from '@/lib/hooks/use-instructor-api';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users, CheckCircle, Star } from 'lucide-react';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { format } from 'date-fns';

export default function InstructorAnalyticsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { data: courses, isLoading: isLoadingCourses } = useInstructorCourses();
  const { data: analytics, isLoading: isLoadingAnalytics } = useCourseAnalytics(
    selectedCourseId || 0
  );

  const selectedCourse = courses?.find((c) => c.courseId === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track course performance and student engagement
          </p>
        </div>
      </div>

      {/* Course Selector */}
      <Card className="p-6">
        <Select
          value={selectedCourseId?.toString() || ''}
          onValueChange={(value) => setSelectedCourseId(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a course to view analytics" />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId.toString()}>
                {course.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {!selectedCourseId ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a course to view analytics</p>
        </div>
      ) : isLoadingAnalytics ? (
        <div className="space-y-6">
          <CardSkeleton count={4} />
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold mt-2">
                    {analytics.completionRate.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Progress value={analytics.completionRate} className="mt-4" />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-3xl font-bold mt-2">
                    {analytics.studentEngagement.active}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {analytics.studentEngagement.inactive} inactive
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  <p className="text-3xl font-bold mt-2">
                    {selectedCourse?.enrollmentCount || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-bold mt-2 flex items-center">
                    {selectedCourse?.averageRating.toFixed(1) || '0.0'}
                    <Star className="h-5 w-5 ml-2 fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Enrollment Trend */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Enrollment Trend</h2>
            {analytics.enrollmentTrend && analytics.enrollmentTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Enrollments"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No enrollment data available
              </p>
            )}
          </Card>

          {/* Student Engagement */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Student Engagement</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Active Students</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.studentEngagement.active}
                      </span>
                    </div>
                    <Progress
                      value={
                        (analytics.studentEngagement.active /
                          (analytics.studentEngagement.active +
                            analytics.studentEngagement.inactive)) *
                        100
                      }
                      className="h-3"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Inactive Students</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.studentEngagement.inactive}
                      </span>
                    </div>
                    <Progress
                      value={
                        (analytics.studentEngagement.inactive /
                          (analytics.studentEngagement.active +
                            analytics.studentEngagement.inactive)) *
                        100
                      }
                      className="h-3"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600">
                    {(
                      (analytics.studentEngagement.active /
                        (analytics.studentEngagement.active +
                          analytics.studentEngagement.inactive)) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    of students are active
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Rating Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Rating Distribution</h2>
            {analytics.ratingDistribution && analytics.ratingDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f59e0b" name="Number of Ratings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No rating data available
              </p>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
