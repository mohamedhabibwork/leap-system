'use client';

import { useInfinitePosts } from '@/lib/hooks/use-api';
import { CreatePost } from '@/components/shared/create-post';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedSkeleton } from '@/components/loading/feed-skeleton';
import { NoPosts } from '@/components/empty/no-posts';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { AdContainer } from '@/components/ads';
import { AnalyticsEvents } from '@/lib/firebase/analytics';

export default function SocialFeedPage() {
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <CreatePost
        context="timeline"
        placeholder="What's on your mind?"
      />

      {posts.length === 0 ? (
        <NoPosts />
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<FeedSkeleton count={1} />}
          endMessage={
            <p className="text-center text-muted-foreground py-4">
              You've reached the end!
            </p>
          }
        >
          <div className="space-y-4">
            {posts.map((post: any, index: number) => (
              <div key={post.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Link 
                        href={`/hub/social/profile/${post.user?.id}`}
                        onClick={() => handleProfileClick(post.user?.id)}
                      >
                        <Avatar>
                          <AvatarImage src={post.user?.avatar} />
                          <AvatarFallback>
                            {post.user?.firstName?.[0]}
                            {post.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <Link
                          href={`/hub/social/profile/${post.user?.id}`}
                          onClick={() => handleProfileClick(post.user?.id)}
                          className="font-semibold hover:underline"
                        >
                          {post.user?.firstName} {post.user?.lastName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`mt-4 grid gap-2 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {post.images.map((image: string, index: number) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          width={400}
                          height={300}
                          className="rounded-lg object-cover w-full"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.commentCount || 0}
                    </Button>
                  </div>
                  <ShareButton
                    entityType="post"
                    entityId={post.id}
                    url={`/hub/social/post/${post.id}`}
                    title="Check out this post"
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
  );
}
