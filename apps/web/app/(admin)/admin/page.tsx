'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminDashboardStats, useSystemAnalytics } from '@/lib/hooks/use-admin-api';
import { useAnalyticsStore, selectDateRange } from '@/stores/analytics.store';
import { PageLoader } from '@/components/loading/page-loader';

export default function AdminDashboard() {
  const dateRange = useAnalyticsStore(selectDateRange);
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useSystemAnalytics({
    start: dateRange.start,
    end: dateRange.end,
  });

  const isLoading = statsLoading || analyticsLoading;

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: stats?.userGrowthPercent ? `+${stats.userGrowthPercent}%` : '0%',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Active Courses',
      value: stats?.activeCourses?.toLocaleString() || '0',
      change: stats?.courseGrowthPercent ? `+${stats.courseGrowthPercent}%` : '0%',
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents?.toLocaleString() || '0',
      change: stats?.eventGrowthPercent ? `+${stats.eventGrowthPercent}%` : '0%',
      icon: Calendar,
      color: 'text-orange-500',
    },
    {
      title: 'Job Listings',
      value: stats?.jobListings?.toLocaleString() || '0',
      change: stats?.jobGrowthPercent ? `+${stats.jobGrowthPercent}%` : '0%',
      icon: Briefcase,
      color: 'text-purple-500',
    },
  ];

  const chartData = analytics?.chartData || [];
  const recentActivity = analytics?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your platform's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any, i: number) => (
                <div key={activity.id || i} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'course' ? 'bg-green-500' :
                    activity.type === 'event' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
