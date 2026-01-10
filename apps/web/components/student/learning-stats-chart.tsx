'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import type { LearningStats } from '@leap-lms/shared-types';

interface LearningStatsChartProps {
  stats: LearningStats;
}

export function LearningStatsChart({ stats }: LearningStatsChartProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Statistics</CardTitle>
        <CardDescription>Your progress and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Learning Time</span>
              </div>
              <span className="text-2xl font-bold">
                {formatTime(stats.totalLearningTimeMinutes)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Time spent on lessons and activities
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Average Quiz Score</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.averageQuizScore.toFixed(0)}%
              </span>
            </div>
            <Progress value={stats.averageQuizScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Completion Rate</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.courseCompletionRate.toFixed(0)}%
              </span>
            </div>
            <Progress value={stats.courseCompletionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Most Active Day</span>
              </div>
              <span className="text-lg font-semibold">
                {stats.mostActiveDayOfWeek}
              </span>
            </div>
          </div>

          <div className="col-span-full">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats.lessonsCompletedThisWeek}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Lessons this week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats.lessonsCompletedThisMonth}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Lessons this month</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
