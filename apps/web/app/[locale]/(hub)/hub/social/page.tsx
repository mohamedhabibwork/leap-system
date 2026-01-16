'use client';

import { useInfinitePosts } from '@/lib/hooks/use-api';
import { CreatePost } from '@/components/shared/create-post';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';
import { MessageCircle, TrendingUp, Users, Sparkles } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
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
                {['#WebDevelopment', '#AI', '#Design', '#Programming', '#Tech'].map((tag, i) => (
                  <Link
                    key={tag}
                    href={`/hub/search?q=${tag}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium text-sm group-hover:text-primary text-start">{tag}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 900 + 100)}
                      </Badge>
                    </div>
                  </Link>
                ))}
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
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>U{i + 1}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-start">
                      <p className="text-sm font-medium">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">@user{i + 1}</p>
                    </div>
                    <Button size="sm" variant="outline">{t('feed.follow')}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        }
      >
      <div className="space-y-6">
        <CreatePost
          context="timeline"
          placeholder={t('feed.whatsOnYourMind')}
        />

        {/* Filter Tabs */}
        <Card className="card-interactive">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t('feed.forYou')}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                {t('feed.following')}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('feed.trending')}
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
      </FeedLayout>
    </>
  );
}
