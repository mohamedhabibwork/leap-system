'use client';

import { useInfinitePosts, useTrendingSearches } from '@/lib/hooks/use-api';
import { useConnectionSuggestions } from '@/hooks/use-connections';
import { CreatePost } from '@/components/shared/create-post';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';
import { FollowButton } from '@/components/buttons/follow-button';
import { MessageCircle, TrendingUp, Users, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedSkeleton } from '@/components/loading/feed-skeleton';
import { NoPosts } from '@/components/empty/no-posts';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { AdContainer } from '@/components/ads';
import { AnalyticsEvents } from '@/lib/firebase/analytics';
import { UserHoverCard } from '@/components/shared/user-hover-card';
import { FeedLayout } from '@/components/layout';
import { ProfileCard } from '@/components/social/profile-card';
import { QuickAccess, LearningQuickAccess } from '@/components/social/quick-access';
import { useTranslations } from 'next-intl';

export default function SocialFeedPage() {
  const t = useTranslations('social');
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

  const posts = data?.pages.flatMap((page: any) => page.data) || [];

  const handleProfileClick = (userId: number) => {
    try {
      AnalyticsEvents.clickNavigation(`/hub/social/profile/${userId}`, 'social_feed');
    } catch (analyticsError) {
      // Silently fail analytics
    }
  };

  const handleCommentClick = (postId: number) => {
    try {
      AnalyticsEvents.clickNavigation(`/hub/social/post/${postId}`, 'comment_button');
    } catch (analyticsError) {
      // Silently fail analytics
    }
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
            <Card className="card-interactive">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                  <Button variant="default" size="sm" className="gap-1 sm:gap-2 shrink-0">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('feed.forYou')}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('feed.following')}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 shrink-0">
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
                <div className="space-y-4">
                  {posts.map((post: any, index: number) => (
                    <div key={post.id}>
                      <Card className="card-elevated">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <UserHoverCard
                              user={{
                                id: post.user?.id,
                                firstName: post.user?.firstName,
                                lastName: post.user?.lastName,
                                avatar: post.user?.avatar,
                                role: post.user?.role,
                                bio: post.user?.bio,
                                followerCount: post.user?.followerCount,
                                isFollowing: post.user?.isFollowing,
                                isVerified: post.user?.isVerified,
                              }}
                            >
                              <Link 
                                href={`/hub/social/profile/${post.user?.id}`}
                                onClick={() => handleProfileClick(post.user?.id)}
                              >
                                <Avatar className="hover:ring-2 hover:ring-primary transition-all">
                                  <AvatarImage src={post.user?.avatar} />
                                  <AvatarFallback>
                                    {post.user?.firstName?.[0]}
                                    {post.user?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            </UserHoverCard>
                            <div className="flex-1">
                              <UserHoverCard
                                user={{
                                  id: post.user?.id,
                                  firstName: post.user?.firstName,
                                  lastName: post.user?.lastName,
                                  avatar: post.user?.avatar,
                                  role: post.user?.role,
                                  bio: post.user?.bio,
                                  followerCount: post.user?.followerCount,
                                  isFollowing: post.user?.isFollowing,
                                  isVerified: post.user?.isVerified,
                                }}
                              >
                                <Link
                                  href={`/hub/social/profile/${post.user?.id}`}
                                  onClick={() => handleProfileClick(post.user?.id)}
                                  className="font-semibold hover:underline inline-flex items-center gap-1.5 text-start"
                                >
                                  {post.user?.firstName} {post.user?.lastName}
                                </Link>
                              </UserHoverCard>
                              {post.user?.role && (
                                <Badge variant="secondary" className="ms-2 text-xs">
                                  {post.user.role}
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground text-start">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="whitespace-pre-wrap text-start leading-relaxed">{post.content}</p>

                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <div className={`mt-4 grid gap-2 ${
                              post.images.length === 1 ? 'grid-cols-1' :
                              post.images.length === 2 ? 'grid-cols-2' :
                              post.images.length === 3 ? 'grid-cols-3' :
                              'grid-cols-2'
                            }`}>
                              {post.images.slice(0, 4).map((image: string, imgIndex: number) => (
                                <div 
                                  key={imgIndex} 
                                  className={`relative overflow-hidden rounded-lg ${
                                    post.images.length === 1 ? 'aspect-video' : 'aspect-square'
                                  }`}
                                >
                                  <Image
                                    src={image}
                                    alt={`Post image ${imgIndex + 1}`}
                                    fill
                                    className="object-cover transition-transform hover:scale-105"
                                  />
                                  {imgIndex === 3 && post.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                      <span className="text-white text-2xl font-bold">
                                        +{post.images.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t pt-3">
                          <div className="flex items-center gap-1">
                            <LikeButton
                              entityType="post"
                              entityId={post.id}
                              isLiked={post.isLiked}
                              likeCount={post.reactionCount}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCommentClick(post.id)}
                              className="gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-sm">{post.commentCount || 0}</span>
                            </Button>
                          </div>
                          <ShareButton
                            entityType="post"
                            entityId={post.id}
                            url={`/hub/social/post/${post.id}`}
                            title={t('feed.checkOutPost')}
                            shareCount={post.shareCount}
                          />
                        </CardFooter>
                      </Card>
                      {/* Insert sponsored content after every 3 posts */}
                      {(index + 1) % 3 === 0 && (
                        <AdContainer
                          key={`ad-${post.id}-${index}`}
                          placement="social_feed"
                          type="sponsored"
                        />
                      )}
                    </div>
                  ))}
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
                    <div key={user.id || user.userId} className="flex items-center gap-3">
                      <Link href={`/hub/social/profile/${user.id || user.userId}`}>
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
                          href={`/hub/social/profile/${user.id || user.userId}`}
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
                        entityId={user.id || user.userId}
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
    </>
  );
}
