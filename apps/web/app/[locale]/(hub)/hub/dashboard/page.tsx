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

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Mock data - replace with real API calls
  const stats = {
    posts: { count: 24, engagement: 356, reach: 1240, trend: 12 },
    groups: { owned: 3, joined: 12, trend: 5 },
    pages: { owned: 2, followers: 845, trend: 8 },
    events: { created: 5, attending: 18, trend: 15 },
    jobs: { posted: 2, applications: 34, trend: 20 },
  };

  // Mock chart data
  const engagementData = [
    { date: 'Mon', value: 45 },
    { date: 'Tue', value: 52 },
    { date: 'Wed', value: 61 },
    { date: 'Thu', value: 58 },
    { date: 'Fri', value: 72 },
    { date: 'Sat', value: 65 },
    { date: 'Sun', value: 68 },
  ];

  // Mock activity data
  const recentActivities = [
    {
      id: 1,
      type: 'post' as const,
      title: 'New Post Created',
      description: 'You created a new post in Web Development',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'event' as const,
      title: 'Event Registration',
      description: 'Your event Tech Meetup 2024 has 12 new registrations',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'group' as const,
      title: 'New Group Members',
      description: '5 people joined your group JavaScript Developers',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'like' as const,
      title: 'Post Liked',
      description: 'Your post received 23 new likes',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const quickActions = [
    {
      id: 'post' as const,
      label: 'Create Post',
      icon: MessageSquare,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'event' as const,
      label: 'Create Event',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'job' as const,
      label: 'Post Job',
      icon: Briefcase,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'group' as const,
      label: 'Create Group',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'page' as const,
      label: 'Create Page',
      icon: FileText,
      color: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display text-start">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Welcome back! Here's what's happening with your content
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="card-feature">
        <CardHeader>
          <CardTitle className="text-start flex items-center gap-2">
            Quick Actions
            <Badge variant="secondary" className="text-xs">Fast create</Badge>
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
            <CardTitle className="text-sm font-medium text-start">My Posts</CardTitle>
            <div className="p-2 rounded-lg bg-section-social/10">
              <MessageSquare className="h-4 w-4 text-section-social" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.posts.count}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.posts.trend}%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
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
                Manage Posts
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Groups Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Groups</CardTitle>
            <div className="p-2 rounded-lg bg-section-social/10">
              <Users className="h-4 w-4 text-section-social" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.groups.owned}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.groups.trend}%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              Joined {stats.groups.joined} groups
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-groups" className="flex items-center gap-1">
                Manage Groups
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pages Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Pages</CardTitle>
            <div className="p-2 rounded-lg bg-section-courses/10">
              <FileText className="h-4 w-4 text-section-courses" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.pages.owned}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.pages.trend}%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {stats.pages.followers} total followers
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-pages" className="flex items-center gap-1">
                Manage Pages
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Events Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Events</CardTitle>
            <div className="p-2 rounded-lg bg-section-events/10">
              <Calendar className="h-4 w-4 text-section-events" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.events.created}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.events.trend}%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              Attending {stats.events.attending} events
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/events" className="flex items-center gap-1">
                View Events
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Stats */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Jobs</CardTitle>
            <div className="p-2 rounded-lg bg-section-jobs/10">
              <Briefcase className="h-4 w-4 text-section-jobs" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.jobs.posted}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">+{stats.jobs.trend}%</span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
            <p className="text-xs text-muted-foreground text-start mt-3">
              {stats.jobs.applications} total applications
            </p>
            <Button variant="link" className="px-0 mt-3 text-start h-auto p-0 group" asChild>
              <Link href="/hub/my-jobs" className="flex items-center gap-1">
                Manage Jobs
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Overall Engagement */}
        <Card className="card-elevated bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Engagement</CardTitle>
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
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatsChart
          title="Engagement Over Time"
          description="Your engagement trend for the last 7 days"
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
      />
    </div>
  );
}
