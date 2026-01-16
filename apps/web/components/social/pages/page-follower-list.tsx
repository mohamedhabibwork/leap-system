'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserMinus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { usePageFollowers } from '@/lib/hooks/use-api';

interface PageFollowerListProps {
  pageId: number;
  showSearch?: boolean;
  limit?: number;
}

export function PageFollowerList({
  pageId,
  showSearch = true,
  limit,
}: PageFollowerListProps) {
  const t = useTranslations('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch page followers
  const { data, isLoading } = usePageFollowers(pageId, { search: searchQuery });
  
  // Transform data to match component expectations
  const followersData = data ? {
    data: (data.data || []).map((follower: any) => ({
      id: follower.id,
      firstName: follower.firstName || '',
      lastName: follower.lastName || '',
      avatar: follower.avatar || null,
      headline: follower.bio || '',
      followedAt: new Date().toISOString(), // TODO: Get from follow record
      isVerified: false, // TODO: Get from user record
    })),
    total: data.pagination?.total || 0,
  } : null;

  const removeFollowerMutation = useMutation({
    mutationFn: async (followerId: number) => {
      // API call to remove follower
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success(t('followerRemoved'));
      queryClient.invalidateQueries({ queryKey: ['page-followers', pageId] });
      queryClient.invalidateQueries({ queryKey: ['page-analytics', pageId] });
    },
    onError: () => {
      toast.error(t('followerRemoveFailed'));
    },
  });

  const handleRemoveFollower = (followerId: number) => {
    if (window.confirm(t('confirmRemoveFollower'))) {
      removeFollowerMutation.mutate(followerId);
    }
  };

  const followers = followersData?.data || [];
  const displayedFollowers = limit ? followers.slice(0, limit) : followers;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-2xl font-bold">{followersData?.total.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground">{t('totalFollowers')}</p>
        </div>
        <UserCheck className="h-8 w-8 text-muted-foreground" />
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchFollowers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
      )}

      <div className="space-y-3">
        {displayedFollowers.map((follower) => (
          <Card key={follower.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/hub/users/${follower.id}`}>
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                      <AvatarImage src={follower.avatar || undefined} />
                      <AvatarFallback>
                        {follower.firstName[0]}
                        {follower.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hub/users/${follower.id}`}
                        className="font-medium hover:underline"
                      >
                        {follower.firstName} {follower.lastName}
                      </Link>
                      {follower.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    {follower.headline && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {follower.headline}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Followed {new Date(follower.followedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/hub/users/${follower.id}`}>
                      {t('viewProfile')}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFollower(follower.id)}
                    disabled={removeFollowerMutation.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {limit && followers.length > limit && (
        <Button variant="outline" className="w-full">
          {t('viewAllFollowers', { count: followersData?.total || 0 })}
        </Button>
      )}
    </div>
  );
}
