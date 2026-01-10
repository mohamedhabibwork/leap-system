'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { DashboardHeader } from '@/components/student/dashboard-header';
import { LearningProgressCard } from '@/components/student/learning-progress-card';
import { PendingTasksCard } from '@/components/student/pending-tasks-card';
import { ActivityFeed } from '@/components/student/activity-feed';
import { RecommendationsCarousel } from '@/components/student/recommendations-carousel';
import { LearningStatsChart } from '@/components/student/learning-stats-chart';
import { AchievementBadges } from '@/components/student/achievement-badges';
import {
  useStudentDashboard,
  useStudentCourses,
  usePendingAssignments,
  usePendingQuizzes,
  useCourseRecommendations,
  useLearningStats,
  useAchievements,
} from '@/lib/hooks/use-student-api';
import { BookOpen, TrendingUp, Award, GraduationCap } from 'lucide-react';

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const { data: dashboard, isLoading: dashboardLoading } = useStudentDashboard();
  const { data: courses, isLoading: coursesLoading } = useStudentCourses();
  const { data: assignments, isLoading: assignmentsLoading } = usePendingAssignments();
  const { data: quizzes, isLoading: quizzesLoading } = usePendingQuizzes();
  const { data: recommendations, isLoading: recommendationsLoading } = useCourseRecommendations();
  const { data: stats, isLoading: statsLoading } = useLearningStats();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();

  const isLoading = dashboardLoading || coursesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton count={3} />
        </div>
      </div>
    );
  }

  const userName = session?.user?.username || session?.user?.firstName || session?.user?.email?.split('@')[0] || 'Student';

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader 
        userName={userName} 
        learningStreak={dashboard?.learningStreak || 0} 
      />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              <p className="text-3xl font-bold mt-2">{dashboard?.totalEnrolledCourses || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold mt-2">{dashboard?.coursesInProgress || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold mt-2">{dashboard?.completedCourses || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Certificates</p>
              <p className="text-3xl font-bold mt-2">{dashboard?.certificatesEarned || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Learning Progress */}
      {courses && courses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Continue Learning</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <LearningProgressCard key={course.courseId} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingTasksCard 
          assignments={assignments || []} 
          quizzes={quizzes || []} 
        />
        <ActivityFeed activities={dashboard?.recentActivity || []} />
      </div>

      {/* Learning Statistics */}
      {stats && <LearningStatsChart stats={stats} />}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsCarousel recommendations={recommendations} />
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <AchievementBadges achievements={achievements} />
      )}

      {/* Empty State */}
      {(!courses || courses.length === 0) && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-semibold">Start Your Learning Journey</h3>
            <p className="text-muted-foreground">
              You haven't enrolled in any courses yet. Browse our course catalog to get started!
            </p>
            <a href="/hub/courses">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Browse Courses
              </button>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
