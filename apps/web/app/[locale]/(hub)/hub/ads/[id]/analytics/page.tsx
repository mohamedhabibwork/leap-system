'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, MousePointerClick, Eye, Users } from 'lucide-react';

// Mock data - replace with actual API call
const mockAnalytics = {
  adId: 1,
  title: 'Learn React Today',
  totalImpressions: 15234,
  totalClicks: 823,
  ctr: 5.4,
  uniqueUsers: 4521,
  dailyStats: [
    { date: '2026-01-01', impressions: 1200, clicks: 64 },
    { date: '2026-01-02', impressions: 1350, clicks: 71 },
    { date: '2026-01-03', impressions: 1425, clicks: 78 },
    { date: '2026-01-04', impressions: 1290, clicks: 67 },
    { date: '2026-01-05', impressions: 1510, clicks: 82 },
    { date: '2026-01-06', impressions: 1680, clicks: 92 },
    { date: '2026-01-07', impressions: 1589, clicks: 85 },
  ],
  topPlacements: [
    { placement: 'Homepage Hero', count: 8234 },
    { placement: 'Courses Listing', count: 5123 },
    { placement: 'Social Feed', count: 1877 },
  ],
};

export default function AdAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ad Analytics</h1>
          <p className="text-muted-foreground">{mockAnalytics.title}</p>
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
            <div className="text-2xl font-bold">{mockAnalytics.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Times ad was shown</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.ctr}%</div>
            <p className="text-xs text-muted-foreground">Performance metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.uniqueUsers.toLocaleString()}</div>
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
            {mockAnalytics.dailyStats.map((day) => (
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
            {mockAnalytics.topPlacements.map((placement, index) => (
              <div key={placement.placement} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{placement.placement}</p>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(placement.count / mockAnalytics.totalImpressions) * 100}%` }}
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
