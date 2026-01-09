'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, XCircle, BarChart3, AlertCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const mockPendingAds = [
  {
    id: 1,
    title: 'Learn React Today',
    user: { name: 'John Doe', email: 'john@example.com' },
    type: 'Banner',
    targetType: 'course',
    isPaid: true,
    createdAt: '2026-01-09T10:30:00Z',
  },
  {
    id: 2,
    title: 'Web Development Course',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    type: 'Sponsored',
    targetType: 'external',
    isPaid: false,
    createdAt: '2026-01-09T09:15:00Z',
  },
];

const mockAllAds = [
  {
    id: 3,
    title: 'Data Science Bootcamp',
    user: { name: 'Bob Johnson', email: 'bob@example.com' },
    type: 'Banner',
    status: 'Active',
    impressions: 45231,
    clicks: 2341,
    ctr: 5.2,
  },
  {
    id: 4,
    title: 'Marketing Masterclass',
    user: { name: 'Alice Williams', email: 'alice@example.com' },
    type: 'Sponsored',
    status: 'Paused',
    impressions: 23451,
    clicks: 1123,
    ctr: 4.8,
  },
];

export default function AdminAdsPage() {
  const [pendingAds, setPendingAds] = useState(mockPendingAds);
  const [allAds, setAllAds] = useState(mockAllAds);

  const handleApprove = (adId: number) => {
    console.log('Approving ad:', adId);
    setPendingAds(pendingAds.filter(ad => ad.id !== adId));
  };

  const handleReject = (adId: number) => {
    console.log('Rejecting ad:', adId);
    setPendingAds(pendingAds.filter(ad => ad.id !== adId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ad Management</h1>
        <p className="text-muted-foreground mt-2">
          Review, approve, and manage ads across the platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAds.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allAds.filter(ad => ad.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,543</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.0%</div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingAds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingAds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Ads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pending Ads Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">No ads pending review</p>
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </CardContent>
            </Card>
          ) : (
            pendingAds.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{ad.title}</h3>
                        <Badge variant="outline">{ad.type}</Badge>
                        {ad.isPaid && <Badge variant="secondary">Paid</Badge>}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Created by: {ad.user.name} ({ad.user.email})</p>
                        <p>Target: {ad.targetType}</p>
                        <p>Created: {new Date(ad.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/ads/${ad.id}/preview`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </Link>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(ad.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(ad.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* All Ads Tab */}
        <TabsContent value="all" className="space-y-4">
          {allAds.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <Badge variant="outline">{ad.type}</Badge>
                      <Badge
                        variant={ad.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {ad.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Created By</p>
                        <p className="font-medium">{ad.user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="font-medium">{ad.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="font-medium">{ad.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="font-medium">{ad.ctr}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/ads/${ad.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform-Wide Ad Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Impressions</p>
                    <p className="text-3xl font-bold">1,234,567</p>
                    <p className="text-xs text-green-600">+15% from last month</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-3xl font-bold">61,728</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average CTR</p>
                    <p className="text-3xl font-bold">5.0%</p>
                    <p className="text-xs text-green-600">+0.3% from last month</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Performing Ads</h3>
                  <div className="space-y-2">
                    {allAds.map((ad, index) => (
                      <div
                        key={ad.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{ad.title}</p>
                            <p className="text-sm text-muted-foreground">{ad.user.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{ad.ctr}% CTR</p>
                          <p className="text-sm text-muted-foreground">
                            {ad.clicks.toLocaleString()} clicks
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
