'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, MousePointerClick, Eye, Users } from 'lucide-react';
import { useAdAnalytics } from '@/lib/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const adId = parseInt(params.id, 10);
  
  // Fetch real analytics from API
  const { data: analyticsData, isLoading } = useAdAnalytics(adId);
  
  // Transform data to match component expectations
  const analytics = analyticsData ? {
    adId: adId,
    title: analyticsData.title || 'Ad Analytics',
    totalImpressions: analyticsData.totalImpressions || 0,
    totalClicks: analyticsData.totalClicks || 0,
    ctr: analyticsData.ctr || 0,
    uniqueUsers: analyticsData.uniqueUsers || 0,
    dailyStats: analyticsData.dailyStats || [],
    topPlacements: analyticsData.topPlacements || [],
  } : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ad Analytics</h1>
          <p className="text-muted-foreground">{analytics.title}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Times ad was shown</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ctr}%</div>
            <p className="text-xs text-muted-foreground">Performance metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Individual viewers</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.dailyStats.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">{day.date}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-32 text-sm">Impressions</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(day.impressions / 2000) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{day.impressions}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 text-sm">Clicks</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(day.clicks / 100) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{day.clicks}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Placements */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Placements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPlacements.map((placement, index) => (
              <div key={placement.placement} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{placement.placement}</p>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${analytics.totalImpressions > 0 ? (placement.count / analytics.totalImpressions) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">{placement.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
