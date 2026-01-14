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

  // Mock query - replace with real API
  const { data, isLoading } = useQuery({
    queryKey: ['page-analytics', pageId],
    queryFn: async () => {
      // Mock analytics data
      return {
        overview: {
          totalFollowers: 1247,
          followersGrowth: 12.5,
          totalViews: 8432,
          viewsGrowth: 8.3,
          totalLikes: 3241,
          likesGrowth: 15.2,
          totalShares: 892,
          sharesGrowth: 6.7,
          engagementRate: 4.8,
          engagementGrowth: 2.1,
        },
        demographics: {
          topCountries: [
            { country: 'United States', percentage: 35 },
            { country: 'United Kingdom', percentage: 18 },
            { country: 'Canada', percentage: 12 },
            { country: 'Australia', percentage: 10 },
            { country: 'Germany', percentage: 8 },
          ],
          ageGroups: [
            { range: '18-24', count: 312 },
            { range: '25-34', count: 524 },
            { range: '35-44', count: 287 },
            { range: '45-54', count: 98 },
            { range: '55+', count: 26 },
          ],
        },
        engagement: [
          { date: '2024-03-01', views: 234, likes: 45, shares: 12, comments: 23 },
          { date: '2024-03-02', views: 312, likes: 67, shares: 18, comments: 34 },
          { date: '2024-03-03', views: 289, likes: 54, shares: 15, comments: 28 },
          { date: '2024-03-04', views: 401, likes: 89, shares: 24, comments: 45 },
          { date: '2024-03-05', views: 356, likes: 72, shares: 19, comments: 38 },
          { date: '2024-03-06', views: 423, likes: 98, shares: 28, comments: 52 },
          { date: '2024-03-07', views: 387, likes: 81, shares: 21, comments: 41 },
        ],
        topPosts: [
          {
            id: 1,
            content: 'Announcing our new product launch!',
            views: 2341,
            likes: 432,
            shares: 87,
            comments: 156,
          },
          {
            id: 2,
            content: 'Behind the scenes of our latest project',
            views: 1876,
            likes: 321,
            shares: 54,
            comments: 98,
          },
          {
            id: 3,
            content: 'Team spotlight: Meet our amazing developers',
            views: 1542,
            likes: 287,
            shares: 43,
            comments: 76,
          },
        ],
      };
    },
  });

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

  const analytics = data!;

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
