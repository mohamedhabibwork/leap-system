'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Calendar, 
  Briefcase,
  TrendingUp,
  Eye,
  Heart,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { 
  CreatePostModal,
  CreateGroupModal,
  CreatePageModal,
  CreateEventModal,
  CreateJobModal,
} from '@/components/modals';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';

type ModalType = 'post' | 'group' | 'page' | 'event' | 'job' | null;

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // ... (stats, engagementData, recentActivities remain same for now as they are mock)

  const quickActions = [
    {
      id: 'post' as const,
      label: t('quickActionsItems.createPost', { defaultValue: 'Create Post' }),
      icon: MessageSquare,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'event' as const,
      label: t('quickActionsItems.createEvent', { defaultValue: 'Create Event' }),
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'job' as const,
      label: t('quickActionsItems.postJob', { defaultValue: 'Post Job' }),
      icon: Briefcase,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'group' as const,
      label: t('quickActionsItems.createGroup', { defaultValue: 'Create Group' }),
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'page' as const,
      label: t('quickActionsItems.createPage', { defaultValue: 'Create Page' }),
      icon: FileText,
      color: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display text-start">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-start">
            {t('welcomeSubtitle')}
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          {t('aiInsights')}
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="card-feature">
        <CardHeader>
          <CardTitle className="text-start flex items-center gap-2">
            {t('quickActions')}
            <Badge variant="secondary" className="text-xs">{t('fastCreate')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-24 flex-col gap-2 card-interactive border-2"
                  onClick={() => setActiveModal(action.id)}
                >
                  <div className={`p-2.5 rounded-xl ${action.color} shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Posts Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.myPosts')}</CardTitle>
            <div className="p-2 rounded-lg bg-section-social/10">
              <MessageSquare className="h-4 w-4 text-section-social" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.posts.count}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.posts.trend}%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastWeek')}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{stats.posts.engagement}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{stats.posts.reach}</span>
              </div>
            </div>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-posts" className="flex items-center gap-1">
                {t('managePosts')}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Groups Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.myGroups')}</CardTitle>
            <div className="p-2 rounded-lg bg-section-social/10">
              <Users className="h-4 w-4 text-section-social" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.groups.owned}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.groups.trend}%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastWeek')}</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {t('stats.joinedGroups', { count: stats.groups.joined })}
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-groups" className="flex items-center gap-1">
                {t('manageGroups')}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pages Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.myPages')}</CardTitle>
            <div className="p-2 rounded-lg bg-section-courses/10">
              <FileText className="h-4 w-4 text-section-courses" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.pages.owned}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.pages.trend}%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastWeek')}</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {t('stats.totalFollowers', { count: stats.pages.followers })}
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-pages" className="flex items-center gap-1">
                {t('managePages')}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Events Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.myEvents')}</CardTitle>
            <div className="p-2 rounded-lg bg-section-events/10">
              <Calendar className="h-4 w-4 text-section-events" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.events.created}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.events.trend}%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastWeek')}</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {t('stats.attendingEvents', { count: stats.events.attending })}
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/events" className="flex items-center gap-1">
                {t('viewEvents')}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.myJobs')}</CardTitle>
            <div className="p-2 rounded-lg bg-section-jobs/10">
              <Briefcase className="h-4 w-4 text-section-jobs" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.jobs.posted}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.jobs.trend}%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastWeek')}</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {t('stats.totalApplications', { count: stats.jobs.applications })}
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-jobs" className="flex items-center gap-1">
                {t('manageJobs')}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl-flip" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Overall Engagement */}
        <Card className="card-elevated bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('stats.totalEngagement')}</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {stats.posts.engagement + stats.pages.followers}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+12%</span>
              <span className="text-xs text-muted-foreground">{t('stats.fromLastMonth')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatsChart
          title={t('engagementOverTime')}
          description={t('engagementTrend')}
          data={engagementData}
          color="hsl(var(--section-social))"
        />
        <ActivityTimeline activities={recentActivities} />
      </div>


      {/* Modals */}
      <CreatePostModal
        open={activeModal === 'post'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateGroupModal
        open={activeModal === 'group'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreatePageModal
        open={activeModal === 'page'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateEventModal
        open={activeModal === 'event'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateJobModal
        open={activeModal === 'job'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        companyId={1}
      />
    </div>
  );
}
