'use client';

import { useInstructorDashboard } from '@/lib/hooks/use-instructor-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionCard } from '@/components/instructor/session-card';
import { RevenueChart } from '@/components/instructor/revenue-chart';
import { EnrollmentChart } from '@/components/instructor/enrollment-chart';
import { EngagementChart } from '@/components/instructor/engagement-chart';
import { TopCoursesTable } from '@/components/instructor/top-courses-table';
import { StatComparisonCard } from '@/components/instructor/stat-comparison-card';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  Plus, 
  Calendar,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { CardSkeleton } from '@/components/loading/card-skeleton';

export default function InstructorDashboardPage() {
  const { data: dashboard, isLoading } = useInstructorDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courses, sessions, and track student progress
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/hub/instructor/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
          <Link href="/hub/instructor/sessions/new">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatComparisonCard
          title="Total Courses"
          value={dashboard.totalCourses}
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
          iconColor="bg-blue-100"
        />
        <StatComparisonCard
          title="Total Students"
          value={dashboard.totalStudents}
          icon={<Users className="h-6 w-6 text-green-600" />}
          iconColor="bg-green-100"
        />
        <StatComparisonCard
          title="Total Revenue"
          value={`$${dashboard.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          iconColor="bg-purple-100"
        />
        <StatComparisonCard
          title="Average Rating"
          value={dashboard.averageRating.toFixed(1)}
          icon={<Star className="h-6 w-6 text-yellow-600" />}
          iconColor="bg-yellow-100"
        />
      </div>

      {/* Pending Actions */}
      {dashboard.pendingAssignments > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold">
                  {dashboard.pendingAssignments} assignment{dashboard.pendingAssignments !== 1 ? 's' : ''} pending review
                </p>
                <p className="text-sm text-muted-foreground">
                  Students are waiting for feedback
                </p>
              </div>
            </div>
            <Link href="/hub/instructor/grading">
              <Button>Review Now</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={dashboard.revenueChartData || []} />
        <EnrollmentChart data={dashboard.enrollmentChartData || []} />
      </div>

      {/* Top Performing Courses */}
      {dashboard.topCourses && dashboard.topCourses.length > 0 && (
        <TopCoursesTable courses={dashboard.topCourses} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </h2>
            <Link href="/hub/instructor/sessions">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {dashboard.upcomingSessions && dashboard.upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {dashboard.upcomingSessions.slice(0, 3).map((session: any) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions</p>
              <Link href="/hub/instructor/sessions/new">
                <Button variant="link" className="mt-2">
                  Schedule your first session
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          
          {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="bg-background p-2 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/hub/instructor/courses">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Courses
            </Button>
          </Link>
          <Link href="/hub/instructor/students">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              View Students
            </Button>
          </Link>
          <Link href="/hub/instructor/grading">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Grade Assignments
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
