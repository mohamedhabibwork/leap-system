'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, Users, Briefcase, FileText, Heart, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: number;
  type: 'post' | 'event' | 'group' | 'job' | 'page' | 'like' | 'follow';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxHeight?: string;
}

const activityConfig = {
  post: { icon: MessageSquare, color: 'bg-section-social/10 text-section-social dark:bg-section-social/20' },
  event: { icon: Calendar, color: 'bg-section-events/10 text-section-events dark:bg-section-events/20' },
  group: { icon: Users, color: 'bg-section-social/10 text-section-social dark:bg-section-social/20' },
  job: { icon: Briefcase, color: 'bg-section-jobs/10 text-section-jobs dark:bg-section-jobs/20' },
  page: { icon: FileText, color: 'bg-section-courses/10 text-section-courses dark:bg-section-courses/20' },
  like: { icon: Heart, color: 'bg-destructive/10 text-destructive dark:bg-destructive/20' },
  follow: { icon: UserPlus, color: 'bg-info/10 text-info dark:bg-info/20' },
};

export function ActivityTimeline({ activities, maxHeight = '400px' }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-start">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="px-6 pb-4" style={{ maxHeight }}>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-full ${config.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}