'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Heart, 
  Share2, 
  TrendingUp, 
  Users, 
  UserPlus,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageAnalytics } from '@/lib/hooks/use-api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PageAnalyticsProps {
  pageId: number;
}

export function PageAnalytics({ pageId }: PageAnalyticsProps) {
  const t = useTranslations('pages.analytics');

  // Fetch page analytics
  const { data: analyticsData, isLoading } = usePageAnalytics(pageId);
  
  // Transform data to match component expectations
  const data = analyticsData ? {
    overview: {
      totalFollowers: analyticsData.overview?.totalFollowers || 0,
      followersGrowth: 0, // TODO: Calculate from historical data
      totalViews: 0, // TODO: Sum from engagement data
      viewsGrowth: 0,
      totalLikes: analyticsData.overview?.totalLikes || 0,
      likesGrowth: 0,
      totalShares: 0,
      sharesGrowth: 0,
      engagementRate: analyticsData.overview?.engagementRate || 0,
      engagementGrowth: 0,
    },
    demographics: {
      topCountries: [], // TODO: Add demographics tracking
      ageGroups: [],
    },
    engagement: analyticsData.engagement || [],
    topPosts: analyticsData.topPosts || [],
  } : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const analytics = data;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalFollowers')}</p>
                <p className="text-2xl font-bold">{analytics.overview.totalFollowers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{analytics.overview.followersGrowth}% {t('fromLastMonth')}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalViews')}</p>
                <p className="text-2xl font-bold">{analytics.overview.totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{analytics.overview.viewsGrowth}% {t('fromLastMonth')}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalLikes')}</p>
                <p className="text-2xl font-bold">{analytics.overview.totalLikes.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{analytics.overview.likesGrowth}% {t('fromLastMonth')}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('engagementRate')}</p>
                <p className="text-2xl font-bold">{analytics.overview.engagementRate}%</p>
                <p className="text-xs text-green-600 mt-1">
                  +{analytics.overview.engagementGrowth}% {t('fromLastMonth')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('engagementOverTime')}</CardTitle>
          <CardDescription>{t('last7Days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.engagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#8b5cf6" name={t('views')} />
              <Line type="monotone" dataKey="likes" stroke="#ef4444" name={t('likes')} />
              <Line type="monotone" dataKey="shares" stroke="#3b82f6" name={t('shares')} />
              <Line type="monotone" dataKey="comments" stroke="#10b981" name={t('comments')} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('topCountries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.demographics.topCountries.map((country, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{country.country}</span>
                    <span className="text-sm text-muted-foreground">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('ageDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.demographics.ageGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name={t('followers')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('topPosts')}</CardTitle>
          <CardDescription>{t('bestPerforming')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.shares}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
