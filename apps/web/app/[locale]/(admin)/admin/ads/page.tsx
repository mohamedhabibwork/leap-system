'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, XCircle, BarChart3, AlertCircle } from 'lucide-react';
import {
  usePendingAds,
  useAdminAds,
  useAdminAdStatistics,
  useApproveAd,
  useRejectAd,
} from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { useToast } from '@/components/ui/use-toast';

export default function AdminAdsPage() {
  const { data: pendingAdsResponse, isLoading: isPendingLoading } = usePendingAds();
  const { data: allAdsResponse, isLoading: isAllAdsLoading } = useAdminAds();
  const { data: statistics, isLoading: isStatsLoading } = useAdminAdStatistics();
  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();
  const { toast } = useToast();

  const pendingAds = pendingAdsResponse?.data || [];
  const allAds = allAdsResponse?.data || [];

  const handleApprove = async (adId: number) => {
    try {
      await approveAd.mutateAsync(adId);
      toast({
        title: 'Success',
        description: 'Ad approved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve ad',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (adId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await rejectAd.mutateAsync({ id: adId, reason: reason || undefined });
      toast({
        title: 'Success',
        description: 'Ad rejected successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject ad',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'Draft';
      case 2:
        return 'Pending Review';
      case 3:
        return 'Active';
      case 4:
        return 'Paused';
      case 5:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (isPendingLoading || isAllAdsLoading || isStatsLoading) {
    return <PageLoader message="Loading ads data..." />;
  }

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
            <div className="text-2xl font-bold">{statistics?.pendingCount || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.activeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(statistics?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.avgCtr || 0}%</div>
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
            pendingAds.map((ad: any) => (
              <Card key={ad.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{ad.titleEn || ad.titleAr || 'Untitled'}</h3>
                        <Badge variant="outline">Ad</Badge>
                        {ad.isPaid && <Badge variant="secondary">Paid</Badge>}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Created by: User #{ad.createdBy}</p>
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
                        disabled={approveAd.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(ad.id)}
                        disabled={rejectAd.isPending}
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
          {allAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No ads found</p>
              </CardContent>
            </Card>
          ) : (
            allAds.map((ad: any) => (
              <Card key={ad.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{ad.titleEn || ad.titleAr || 'Untitled'}</h3>
                        <Badge variant="outline">Ad</Badge>
                        <Badge
                          variant={ad.statusId === 3 ? 'default' : 'secondary'}
                        >
                          {getStatusLabel(ad.statusId)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Created By</p>
                          <p className="font-medium">User #{ad.createdBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Impressions</p>
                          <p className="font-medium">{(ad.impressionCount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Clicks</p>
                          <p className="font-medium">{(ad.clickCount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="font-medium">{ad.ctr?.toFixed(1) || '0.0'}%</p>
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
            ))
          )}
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
                    <p className="text-3xl font-bold">{(statistics?.totalImpressions || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-3xl font-bold">{(statistics?.totalClicks || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average CTR</p>
                    <p className="text-3xl font-bold">{statistics?.avgCtr || 0}%</p>
                    <p className="text-xs text-muted-foreground">Platform average</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Performing Ads</h3>
                  <div className="space-y-2">
                    {allAds.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No ads to display</p>
                    ) : (
                      allAds
                        .sort((a: any, b: any) => (b.ctr || 0) - (a.ctr || 0))
                        .slice(0, 5)
                        .map((ad: any, index: number) => (
                          <div
                            key={ad.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{ad.titleEn || ad.titleAr || 'Untitled'}</p>
                                <p className="text-sm text-muted-foreground">User #{ad.createdBy}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{ad.ctr?.toFixed(1) || '0.0'}% CTR</p>
                              <p className="text-sm text-muted-foreground">
                                {(ad.clickCount || 0).toLocaleString()} clicks
                              </p>
                            </div>
                          </div>
                        ))
                    )}
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
