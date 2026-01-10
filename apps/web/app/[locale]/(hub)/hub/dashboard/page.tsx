'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

type ModalType = 'post' | 'group' | 'page' | 'event' | 'job' | null;

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Mock data - replace with real API calls
  const stats = {
    posts: { count: 24, engagement: 356, reach: 1240 },
    groups: { owned: 3, joined: 12 },
    pages: { owned: 2, followers: 845 },
    events: { created: 5, attending: 18 },
    jobs: { posted: 2, applications: 34 },
  };

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-start">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-start">
          Overview of your content and activity
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-start">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:scale-105 transition-transform"
                  onClick={() => setActiveModal(action.id)}
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.posts.count}</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{stats.posts.engagement} engagements</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{stats.posts.reach} reach</span>
              </div>
            </div>
            <Button variant="link" className="px-0 mt-2 text-start" asChild>
              <Link href="/hub/my-posts">
                Manage Posts →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Groups Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.groups.owned}</div>
            <p className="text-xs text-muted-foreground text-start mt-2">
              Joined {stats.groups.joined} groups
            </p>
            <Button variant="link" className="px-0 mt-2 text-start" asChild>
              <Link href="/hub/my-groups">
                Manage Groups →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pages Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.pages.owned}</div>
            <p className="text-xs text-muted-foreground text-start mt-2">
              {stats.pages.followers} total followers
            </p>
            <Button variant="link" className="px-0 mt-2 text-start" asChild>
              <Link href="/hub/my-pages">
                Manage Pages →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Events Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.events.created}</div>
            <p className="text-xs text-muted-foreground text-start mt-2">
              Attending {stats.events.attending} events
            </p>
            <Button variant="link" className="px-0 mt-2 text-start" asChild>
              <Link href="/hub/events">
                View Events →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">My Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{stats.jobs.posted}</div>
            <p className="text-xs text-muted-foreground text-start mt-2">
              {stats.jobs.applications} total applications
            </p>
            <Button variant="link" className="px-0 mt-2 text-start" asChild>
              <Link href="/hub/my-jobs">
                Manage Jobs →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Overall Engagement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {stats.posts.engagement + stats.pages.followers}
            </div>
            <p className="text-xs text-green-600 text-start mt-2">
              ↑ 12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-start">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-start">
                  You created a new post in <span className="font-medium">Web Development</span>
                </p>
                <p className="text-xs text-muted-foreground text-start mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-start">
                  Your event <span className="font-medium">Tech Meetup 2024</span> has 12 new registrations
                </p>
                <p className="text-xs text-muted-foreground text-start mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-start">
                  5 people joined your group <span className="font-medium">JavaScript Developers</span>
                </p>
                <p className="text-xs text-muted-foreground text-start mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
