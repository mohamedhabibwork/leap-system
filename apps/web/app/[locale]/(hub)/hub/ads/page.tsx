'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pause, Play, Trash2, BarChart3, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { useAds, usePauseAd, useResumeAd, useDeleteAd } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/loading/page-loader';
import { toast } from 'sonner';

export default function AdsPage() {
  const { data: adsResponse, isLoading, error } = useAds();
  const pauseAd = usePauseAd();
  const resumeAd = useResumeAd();
  const deleteAd = useDeleteAd();

  const ads = adsResponse?.data || [];

  const getStatusColor = (statusId: number) => {
    // Assuming statusIds: 1=draft, 2=pending_review, 3=active, 4=paused, 5=rejected
    switch (statusId) {
      case 3:
        return 'bg-green-500';
      case 4:
        return 'bg-yellow-500';
      case 1:
      case 2:
        return 'bg-gray-500';
      case 5:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  const handleCreateAdClick = () => {
    try {
      AnalyticsEvents.clickNavigation('/hub/ads/new', 'ads_page');
    } catch (error) {
      // Silently fail analytics
    }
  };

  const handleViewAnalyticsClick = (adId: number, adTitle: string) => {
    try {
      AnalyticsEvents.viewAd(adId.toString(), 'analytics');
    } catch (error) {
      // Silently fail analytics
    }
  };

  const handlePauseAd = async (id: number) => {
    try {
      await pauseAd.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Ad paused successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to pause ad',
        variant: 'destructive',
      });
    }
  };

  const handleResumeAd = async (id: number) => {
    try {
      await resumeAd.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Ad resumed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resume ad',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }
    try {
      await deleteAd.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Ad deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ad',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading ads..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <p className="text-destructive">Failed to load ads. Please try again later.</p>
        </Card>
      </div>
    );
  }

  // Calculate totals from ads
  const totalImpressions = ads.reduce((sum: number, ad: any) => sum + (ad.impressionCount || 0), 0);
  const totalClicks = ads.reduce((sum: number, ad: any) => sum + (ad.clickCount || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Ads</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your advertising campaigns
          </p>
        </div>
        <Link href="/hub/ads/new" onClick={handleCreateAdClick}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCtr}%</div>
            <p className="text-xs text-muted-foreground">Across all ads</p>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No ads yet</p>
              <Link href="/hub/ads/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Ad
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad: any) => (
            <Card key={ad.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ad.titleEn || ad.titleAr || 'Untitled'}</h3>
                      <Badge variant="outline">Ad</Badge>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(ad.statusId)}`} />
                      <span className="text-sm text-muted-foreground">{getStatusLabel(ad.statusId)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-xl font-bold">{(ad.impressionCount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-xl font-bold">{(ad.clickCount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="text-xl font-bold">{ad.ctr?.toFixed(1) || '0.0'}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-sm">
                          {format(new Date(ad.startDate), 'MMM d, yyyy')}
                          {ad.endDate && ` - ${format(new Date(ad.endDate), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ad.statusId === 3 ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePauseAd(ad.id)}
                        disabled={pauseAd.isPending}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : ad.statusId === 4 ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResumeAd(ad.id)}
                        disabled={resumeAd.isPending}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Link href={`/hub/ads/${ad.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link 
                      href={`/hub/ads/${ad.id}/analytics`}
                      onClick={() => handleViewAnalyticsClick(ad.id, ad.titleEn || ad.titleAr || 'Ad')}
                    >
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDeleteAd(ad.id)}
                      disabled={deleteAd.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
