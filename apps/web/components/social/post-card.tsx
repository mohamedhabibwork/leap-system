'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { MessageCircle, MoreHorizontal, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { UserHoverCard } from '@/components/shared/user-hover-card';
import { PostComments } from '@/components/social/post-comments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SharedPostCard } from './shared-post-card';
import { Share2 } from 'lucide-react';
import type { Post } from '@/lib/api/posts';
import { useTranslations } from 'next-intl';

interface PostCardProps {
  post: {
    id: number;
    content: string;
    images?: string[];
    createdAt: string;
    reactionCount?: number;
    commentCount?: number;
    shareCount?: number;
    isLiked?: boolean;
    isFavorited?: boolean;
    user: {
      id: number;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      role?: string;
      bio?: string;
      followerCount?: number;
      isFollowing?: boolean;
      isVerified?: boolean;
    };
    sharedPost?: Post;
  };
  onProfileClick?: (userId: number) => void;
  showComments?: boolean;
}

export function PostCard({ post, onProfileClick, showComments: initialShowComments = false }: PostCardProps) {
  const t = useTranslations('social');
  const [showComments, setShowComments] = useState(initialShowComments);
  const [showAllImages, setShowAllImages] = useState(false);

  if (!post || !post.user) return null;

  const displayImages = post.images && post.images.length > 0 
    ? (showAllImages ? post.images : post.images.slice(0, 4))
    : [];

  return (
    <Card className="bg-background border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/10">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <UserHoverCard
            user={{
              id: post.user?.id || 0,
              firstName: post.user?.firstName || '',
              lastName: post.user?.lastName || '',
              avatar: post.user?.avatar || '',
              role: post.user?.role || '',
              bio: post.user?.bio || '',
              followerCount: post.user?.followerCount,
              isFollowing: post.user?.isFollowing,
              isVerified: post.user?.isVerified,
            }}
          >
            <Link 
              href={`/hub/social/profile/${post.user?.id}`}
              onClick={() => onProfileClick?.(post.user?.id)}
              className="block"
            >
              <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all cursor-pointer">
                <AvatarImage src={post.user?.avatar} />
                <AvatarFallback className="text-sm font-medium">
                  {post.user?.firstName?.[0] || ''}
                  {post.user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
            </Link>
          </UserHoverCard>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <UserHoverCard
                user={{
                  id: post.user?.id || 0,
                  firstName: post.user?.firstName || '',
                  lastName: post.user?.lastName || '',
                  avatar: post.user?.avatar || '',
                  role: post.user?.role || '',
                  bio: post.user?.bio || '',
                  followerCount: post.user?.followerCount,
                  isFollowing: post.user?.isFollowing,
                  isVerified: post.user?.isVerified,
                }}
              >
                <Link
                  href={`/hub/social/profile/${post.user?.id}`}
                  onClick={() => onProfileClick?.(post.user?.id)}
                  className="font-semibold text-[15px] hover:underline text-foreground"
                >
                  {post.user?.firstName} {post.user?.lastName}
                </Link>
              </UserHoverCard>
              {post.user?.isVerified && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[13px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.user?.role && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px] border-0">
                    {post.user.role}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Hide post</DropdownMenuItem>
              <DropdownMenuItem>Unfollow</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        {/* Sharer's Comment (if this is a shared post) */}
        {post.sharedPost && post.content && (
          <div className="mb-3">
            <p className="text-[15px] leading-[1.3333] whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        )}

        {/* Shared Post Indicator */}
        {post.sharedPost && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>
              {t('sharedPost.sharedBy') || 'Shared by'}{' '}
              <Link
                href={`/hub/social/profile/${post.user?.id}`}
                onClick={() => onProfileClick?.(post.user?.id)}
                className="font-medium hover:underline text-foreground"
              >
                {post.user?.firstName} {post.user?.lastName}
              </Link>
            </span>
          </div>
        )}

        {/* Shared Post Content */}
        {post.sharedPost ? (
          <div className="mb-3">
            <SharedPostCard
              post={post.sharedPost}
              onProfileClick={onProfileClick}
            />
          </div>
        ) : (
          <>
            {/* Regular Post Content */}
            {post.content && !post.sharedPost && (
              <div className="mb-3">
                <p className="text-[15px] leading-[1.3333] whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              </div>
            )}

            {/* Post Images */}
            {displayImages.length > 0 && (
          <div className={cn(
            "mt-3 rounded-lg overflow-hidden",
            displayImages.length === 1 && "max-h-[600px]",
            displayImages.length === 2 && "grid grid-cols-2 gap-1",
            displayImages.length === 3 && "grid grid-cols-2 gap-1",
            displayImages.length >= 4 && "grid grid-cols-2 gap-1"
          )}>
            {displayImages.map((image: string, imgIndex: number) => {
              const isLastInRow = imgIndex === displayImages.length - 1;
              const remainingCount = post.images && post.images.length > 4 && !showAllImages
                ? post.images.length - 4
                : 0;
              
              return (
                <div
                  key={`${post.id}-img-${imgIndex}`}
                  className={cn(
                    "relative bg-muted",
                    displayImages.length === 1 && "aspect-auto",
                    displayImages.length === 2 && "aspect-square",
                    displayImages.length === 3 && imgIndex === 2 && "col-span-2 aspect-2/1",
                    displayImages.length === 3 && imgIndex < 2 && "aspect-square",
                    displayImages.length >= 4 && "aspect-square"
                  )}
                >
                  <Image
                    src={image}
                    alt={`Post image ${imgIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {isLastInRow && remainingCount > 0 && (
                    <button
                      onClick={() => setShowAllImages(true)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                    >
                      <span className="text-white text-2xl font-bold">
                        +{remainingCount}
                      </span>
                    </button>
                  )}
                </div>
              );
            }            )}
          </div>
            )}
          </>
        )}

        {/* Reaction and Comment Count */}
        {((post.reactionCount || 0) > 0 || (post.commentCount || 0) > 0 || (post.shareCount || 0) > 0) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              {(post.reactionCount || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp className="h-3 w-3 text-white fill-white" />
                  </div>
                  <span className="text-[13px] text-muted-foreground font-medium">
                    {post.reactionCount}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {(post.commentCount || 0) > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-[13px] text-muted-foreground hover:underline"
                >
                  {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                </button>
              )}
              {(post.shareCount || 0) > 0 && (
                <span className="text-[13px] text-muted-foreground">
                  {post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons - Facebook Style */}
      <CardFooter className="px-0 py-0 border-t border-border/50">
        <div className="flex items-center w-full divide-x divide-border/50">
          <Button
            variant="ghost"
            className="flex-1 h-9 rounded-none hover:bg-muted/50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <LikeButton
              entityType="post"
              entityId={post.id}
              isLiked={post.isLiked}
              likeCount={post.reactionCount}
              size="sm"
              showCount={false}
            />
            <span className={cn(
              "ml-2 text-[15px] font-medium",
              post.isLiked ? "text-blue-500" : "text-muted-foreground"
            )}>
              Like
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex-1 h-9 rounded-none hover:bg-muted/50 transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className={cn(
              "h-5 w-5",
              showComments ? "text-blue-500" : "text-muted-foreground"
            )} />
            <span className={cn(
              "ml-2 text-[15px] font-medium",
              showComments ? "text-blue-500" : "text-muted-foreground"
            )}>
              Comment
            </span>
          </Button>

          <Button
            variant="ghost"
            className="flex-1 h-9 rounded-none hover:bg-muted/50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ShareButton
              entityType="post"
              entityId={post.id}
              url={`/hub/social/post/${post.id}`}
              title="Check out this post"
              shareCount={post.shareCount}
              showCount={false}
            />
            <span className="ml-2 text-[15px] font-medium text-muted-foreground">
              Share
            </span>
          </Button>

          <Button
            variant="ghost"
            className="h-9 w-9 rounded-none hover:bg-muted/50 transition-colors p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FavoriteButton
              entityType="post"
              entityId={post.id}
              isFavorited={post.isFavorited}
              size="sm"
            />
          </Button>
        </div>
      </CardFooter>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="border-t border-border/50 bg-muted/30">
          <PostComments
            postId={post.id}
            userId={post.user?.id}
            onCommentAdded={() => {
              // Comments will auto-refresh via query invalidation
            }}
          />
        </div>
      )}
    </Card>
  );
}
