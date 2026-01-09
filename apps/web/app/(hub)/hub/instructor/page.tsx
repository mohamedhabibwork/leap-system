'use client';

import { useInstructorDashboard } from '@/lib/hooks/use-instructor-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionCard } from '@/components/instructor/session-card';
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
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold mt-2">{dashboard.totalCourses}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link href="/hub/instructor/courses">
            <Button variant="link" className="p-0 h-auto mt-4">
              View Courses →
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold mt-2">{dashboard.totalStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Link href="/hub/instructor/students">
            <Button variant="link" className="p-0 h-auto mt-4">
              View Students →
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 flex items-center">
                <DollarSign className="h-7 w-7" />
                {dashboard.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <Link href="/hub/instructor/analytics">
            <Button variant="link" className="p-0 h-auto mt-4">
              View Analytics →
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold mt-2 flex items-center">
                {dashboard.averageRating.toFixed(1)}
                <Star className="h-6 w-6 ml-2 fill-yellow-400 text-yellow-400" />
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
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
              {dashboard.upcomingSessions.slice(0, 3).map((session) => (
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
              {dashboard.recentActivity.map((activity) => (
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
