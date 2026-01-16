'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Calendar, 
  Bookmark,
  Video,
  Briefcase,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGroups, useMyPages, useMyEvents, useBookmarks, useMyJobs, useMyEnrollments } from '@/lib/hooks/use-api';

interface QuickAccessProps {
  className?: string;
}

interface QuickAccessItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
}

export function QuickAccess({ className }: QuickAccessProps) {
  const t = useTranslations('social');

  // Fetch real data from API
  const { data: groups } = useGroups();
  const { data: pages } = useMyPages();
  const { data: events } = useMyEvents();
  const { data: bookmarks } = useBookmarks();
  const { data: jobs } = useMyJobs();

  const items: QuickAccessItem[] = [
    {
      label: t('quickAccess.myGroups'),
      href: '/hub/my-groups',
      icon: Users,
      badge: groups?.data?.length || 0,
      color: 'text-blue-500',
    },
    {
      label: t('quickAccess.myPages'),
      href: '/hub/my-pages',
      icon: FileText,
      badge: pages?.data?.length || 0,
      color: 'text-green-500',
    },
    {
      label: t('quickAccess.myEvents'),
      href: '/hub/events',
      icon: Calendar,
      badge: events?.data?.length || 0,
      color: 'text-orange-500',
    },
    {
      label: t('quickAccess.savedPosts'),
      href: '/hub/saved',
      icon: Bookmark,
      badge: bookmarks?.data?.length || 0,
      color: 'text-purple-500',
    },
    {
      label: t('quickAccess.myJobs'),
      href: '/hub/my-jobs',
      icon: Briefcase,
      badge: jobs?.data?.length || 0,
      color: 'text-amber-500',
    },
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {t('quickAccess.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('h-4 w-4', item.color)} />
                <span className="text-sm group-hover:font-medium">
                  {item.label}
                </span>
              </div>
              {item.badge && item.badge > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        {/* Discover More */}
        <div className="pt-3 border-t mt-3">
          <Link
            href="/hub/discover"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {t('quickAccess.discover')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Learning Quick Access Component
export function LearningQuickAccess({ className }: QuickAccessProps) {
  const t = useTranslations('learning');

  // Fetch real data from API
  const { data: enrollments } = useMyEnrollments({ limit: 2 });
  
  const courses = (enrollments?.data || []).map((enrollment: any) => ({
    id: enrollment.courseId?.toString() || enrollment.id?.toString(),
    title: enrollment.course?.titleEn || enrollment.course?.title || 'Untitled Course',
    progress: enrollment.progress || 0,
    thumbnail: enrollment.course?.thumbnailUrl || null,
  }));

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            {t('quickAccess.myLearning')}
          </CardTitle>
          <Link 
            href="/hub/courses/my-courses"
            className="text-xs text-primary hover:underline"
          >
            {t('quickAccess.viewAll')}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/hub/courses/${course.id}`}
            className="block p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                  {course.title}
                </h4>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{t('quickAccess.progress')}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        <Button 
          asChild 
          variant="outline" 
          className="w-full"
          size="sm"
        >
          <Link href="/hub/courses">
            {t('quickAccess.browseCourses')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
