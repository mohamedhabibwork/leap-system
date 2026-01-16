'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCourse } from '@/lib/hooks/use-api';
import { progressAPI } from '@/lib/api/progress';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export default function CourseProgressPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const t = useTranslations('courses.progress');
  const { id } = use(params);
  const courseId = parseInt(id);
  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressAPI.getCourseProgress(courseId),
    enabled: !!courseId,
  });

  if (courseLoading || progressLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading progress...' })} />;
  }

  if (!course || !progress) {
    return (
      <div className="container mx-auto py-8">
        <p>{t('notFound', { defaultValue: 'Course or progress not found' })}</p>
      </div>
    );
  }

  const progressPercentage = progress.progressPercentage || 0;
  const completionRate = progress.totalLessons > 0 
    ? (progress.completedLessons / progress.totalLessons) * 100 
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{t('progressOverview', { defaultValue: 'Your learning progress' })}</p>
        </div>
        <Link href={`/hub/courses/${courseId}/learn`}>
          <Button>
            {t('continueLearning', { defaultValue: 'Continue Learning' })}
          </Button>
        </Link>
      </div>

      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('overallProgress', { defaultValue: 'Overall Progress' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('completion', { defaultValue: 'Completion' })}</span>
              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {progress.completedLessons}/{progress.totalLessons}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('lessonsCompleted', { defaultValue: 'Lessons' })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progress.timeSpentMinutes / 60)}h
              </div>
              <div className="text-sm text-muted-foreground">
                {t('timeSpent', { defaultValue: 'Time Spent' })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {progress.totalLessons - progress.completedLessons}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('remaining', { defaultValue: 'Remaining' })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {completionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {t('completionRate', { defaultValue: 'Completion Rate' })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('lessons', { defaultValue: 'Lessons' })}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              {progress.completedLessons} {t('completed', { defaultValue: 'completed' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('timeSpent', { defaultValue: 'Time Spent' })}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(progress.timeSpentMinutes / 60)}h {progress.timeSpentMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              {t('totalLearningTime', { defaultValue: 'Total learning time' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('lastAccessed', { defaultValue: 'Last Accessed' })}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.lastAccessedAt 
                ? new Date(progress.lastAccessedAt).toLocaleDateString()
                : t('never', { defaultValue: 'Never' })
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {t('lastActivity', { defaultValue: 'Last activity date' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Status */}
      {progressPercentage >= 100 && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500 p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {t('courseCompleted', { defaultValue: 'Course Completed!' })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('courseCompletedDesc', { defaultValue: 'Congratulations! You have completed this course.' })}
                </p>
              </div>
              <Link href={`/hub/courses/${courseId}/certificate`}>
                <Button>
                  <Award className="h-4 w-4 mr-2" />
                  {t('viewCertificate', { defaultValue: 'View Certificate' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('progressGoal', { defaultValue: 'Progress Goal' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('targetCompletion', { defaultValue: 'Target: 100% Completion' })}</span>
              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progressPercentage < 100 && (
              <p className="text-sm text-muted-foreground">
                {t('keepGoing', { 
                  defaultValue: 'Keep going! You\'re making great progress.',
                  progress: progressPercentage.toFixed(0)
                })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
