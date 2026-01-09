'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pause, Play, Trash2, BarChart3, Edit } from 'lucide-react';
import { format } from 'date-fns';

// This will be replaced with actual API call
const mockAds = [
  {
    id: 1,
    title: 'Learn React Today',
    type: 'Banner',
    status: 'Active',
    impressions: 15234,
    clicks: 823,
    ctr: 5.4,
    startDate: '2026-01-01',
    endDate: '2026-02-01',
  },
  {
    id: 2,
    title: 'Web Development Course',
    type: 'Sponsored',
    status: 'Paused',
    impressions: 8421,
    clicks: 392,
    ctr: 4.7,
    startDate: '2026-01-05',
    endDate: null,
  },
];

export default function AdsPage() {
  const [ads, setAds] = useState(mockAds);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Ads</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your advertising campaigns
          </p>
        </div>
        <Link href="/hub/ads/new">
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
            <div className="text-2xl font-bold">23,655</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,215</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.1%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last month</p>
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
          ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <Badge variant="outline">{ad.type}</Badge>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(ad.status)}`} />
                      <span className="text-sm text-muted-foreground">{ad.status}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-xl font-bold">{ad.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-xl font-bold">{ad.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="text-xl font-bold">{ad.ctr}%</p>
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
                    {ad.status === 'Active' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/hub/ads/${ad.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/hub/ads/${ad.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-destructive">
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
