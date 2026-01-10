'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy, FileCheck, Award } from 'lucide-react';
import type { StudentActivity } from '@leap-lms/shared-types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: StudentActivity[];
}

const activityIcons = {
  lesson_completed: CheckCircle2,
  quiz_passed: Trophy,
  assignment_submitted: FileCheck,
  certificate_earned: Award,
};

const activityColors = {
  lesson_completed: 'text-green-600 bg-green-100',
  quiz_passed: 'text-purple-600 bg-purple-100',
  assignment_submitted: 'text-blue-600 bg-blue-100',
  certificate_earned: 'text-yellow-600 bg-yellow-100',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your learning progress this week</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity. Start learning to see your progress here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    {activity.courseName && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.courseName}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
