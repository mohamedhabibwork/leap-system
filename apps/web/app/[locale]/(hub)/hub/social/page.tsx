'use client';

import { useState } from 'react';
import { useInfinitePosts, useTrendingSearches } from '@/lib/hooks/use-api';
import { useConnectionSuggestions } from '@/hooks/use-connections';
import { CreatePost } from '@/components/shared/create-post';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from '@/components/buttons/follow-button';
import { TrendingUp, Users, Sparkles } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedSkeleton } from '@/components/loading/feed-skeleton';
import { NoPosts } from '@/components/empty/no-posts';
import { Link } from '@/i18n/navigation';
import { AdContainer } from '@/components/ads';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { FeedLayout } from '@/components/layout';
import { ProfileCard } from '@/components/social/profile-card';
import { QuickAccess, LearningQuickAccess } from '@/components/social/quick-access';
import { useTranslations } from 'next-intl';
import { PostCard } from '@/components/social/post-card';
import { PostCommentsModal } from '@/components/modals/post-comments-modal';

// Helper function to extract user ID from user object
function getUserId(user: any): number {
  if (user?.id) return user.id;
  if (user?.userId) return user.userId;
  if (typeof user?.sub === 'number') return user.sub;
  if (typeof user?.sub === 'string') return parseInt(user.sub, 10);
  return 0;
}

export default function SocialFeedPage() {
  const t = useTranslations('social');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfinitePosts();
  
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingSearches(5);
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useConnectionSuggestions(3);
  
  const trendingTopics = trendingData?.data || [];
  const suggestedUsers = suggestionsData?.data || [];

  // Extract posts from paginated response
  const posts = (data?.pages.flatMap((page: any) => {
    // Handle both { data: [...] } and direct array responses
    const pageData = page?.data || (Array.isArray(page) ? page : []);
    return pageData;
  }) || []).filter(
    (post: any) => post && post.id && post.user
  );

  const handleProfileClick = (userId: number) => {
    try {
      AnalyticsEvents.clickNavigation(`/hub/social/profile/${userId}`, 'social_feed');
    } catch (analyticsError) {
      // Silently fail analytics
    }
  };

  const handleCommentClick = (post: any) => {
    try {
      AnalyticsEvents.clickNavigation(`/hub/social/post/${post.id}`, 'comment_button');
    } catch (analyticsError) {
      // Silently fail analytics
    }
    setSelectedPost(post);
    setIsCommentsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CreatePost context="timeline" />
        <FeedSkeleton count={3} />
      </div>
    );
  }

  return (
    <>
      <FeedLayout
        leftSidebar={
          <div className="space-y-4">
            <ProfileCard />
            <QuickAccess />
            <LearningQuickAccess />
          </div>
        }
        mainContent={
          <div className="space-y-4 sm:space-y-6">
            <CreatePost
              context="timeline"
              placeholder={t('feed.whatsOnYourMind')}
            />

            {/* Filter Tabs */}
            <Card className="card-interactive border-border/50">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-1 sm:gap-2 shrink-0 transition-all duration-200"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium">{t('feed.forYou')}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 sm:gap-2 shrink-0 hover:bg-muted/50 transition-colors"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('feed.following')}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 sm:gap-2 shrink-0 hover:bg-muted/50 transition-colors"
                  >
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('feed.trending')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {posts.length === 0 ? (
              <NoPosts />
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={<FeedSkeleton count={1} />}
                endMessage={
                  <Card className="p-6">
                    <p className="text-center text-muted-foreground">
                      {t('feed.endOfFeed')}
                    </p>
                  </Card>
                }
              >
                <div className="space-y-4 sm:space-y-6">
                  {posts.map((post: any, index: number) => {
                    // Skip posts without user data
                    if (!post || !post.user) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={post.id || `post-${index}`}
                        className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                      >
                        <PostCard
                          post={{
                            id: post.id,
                            content: post.content,
                            images: post.images,
                            createdAt: post.createdAt,
                            reactionCount: post.reactionCount || 0,
                            commentCount: post.commentCount || 0,
                            shareCount: post.shareCount || 0,
                            isLiked: post.isLiked,
                            isFavorited: post.isFavorited,
                            user: post.user,
                            sharedPost: post.sharedPost,
                          }}
                          onProfileClick={handleProfileClick}
                        />
                        {/* Insert sponsored content after every 3 posts with smooth transition */}
                        {(index + 1) % 3 === 0 && (
                          <div className="mt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <AdContainer
                              placement="social_feed"
                              type="sponsored"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </InfiniteScroll>
            )}
          </div>
        }
        rightSidebar={
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-section-social" />
                  <h3 className="font-semibold text-start">{t('feed.trendingTopics')}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingTrending ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-8 bg-muted rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : trendingTopics.length > 0 ? (
                  trendingTopics.map((topic: any) => (
                    <Link
                      key={topic.query || topic.id}
                      href={`/hub/search?q=${encodeURIComponent(topic.query || topic.name || '')}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="font-medium text-sm group-hover:text-primary text-start">
                          {topic.query || topic.name || topic}
                        </span>
                        {topic.count && (
                          <Badge variant="secondary" className="text-xs">
                            {topic.count}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t('feed.noTrendingTopics')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-section-social" />
                  <h3 className="font-semibold text-start">{t('feed.whoToFollow')}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSuggestions ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                        <div className="h-8 w-20 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user: any) => (
                    <div key={user.id || getUserId(user)} className="flex items-center gap-3">
                      <Link href={`/hub/social/profile/${user.id || getUserId(user)}`}>
                        <Avatar className="hover:ring-2 hover:ring-primary transition-all">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName?.[0] || user.name?.[0] || 'U'}
                            {user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0 text-start">
                        <Link
                          href={`/hub/social/profile/${user.id || getUserId(user)}`}
                          className="block hover:underline"
                        >
                          <p className="text-sm font-medium truncate">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.name || user.username || 'User'}
                          </p>
                        </Link>
                        {user.username && (
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        )}
                        {user.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      <FollowButton
                        entityType="user"
                        entityId={user.id || getUserId(user)}
                        isFollowing={user.isFollowing || false}
                        size="sm"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    {t('feed.noSuggestions')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        }
      />
      
      {/* Post Comments Modal */}
      {selectedPost && (
        <PostCommentsModal
          open={isCommentsModalOpen}
          onOpenChange={setIsCommentsModalOpen}
          post={selectedPost}
        />
      )}
    </>
  );
}
