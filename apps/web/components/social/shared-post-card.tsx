'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { UserHoverCard } from '@/components/shared/user-hover-card';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Post } from '@/lib/api/posts';
import { useTranslations } from 'next-intl';

interface SharedPostCardProps {
  post: Post;
  className?: string;
  onProfileClick?: (userId: number) => void;
}

export function SharedPostCard({ post, className, onProfileClick }: SharedPostCardProps) {
  const t = useTranslations('social');
  if (!post || !post.user) return null;

  const displayImages = post.images && post.images.length > 0 ? post.images.slice(0, 4) : [];

  return (
    <Card
      className={cn(
        'bg-muted/30 border-border/50 rounded-lg overflow-hidden',
        'hover:bg-muted/40 transition-colors',
        className
      )}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Original Post Author */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3">
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
              onClick={() => onProfileClick?.(post.user?.id || 0)}
              className="block"
            >
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-1 ring-background hover:ring-primary/20 transition-all cursor-pointer">
                <AvatarImage src={post.user?.avatar} />
                <AvatarFallback className="text-xs font-medium">
                  {post.user?.firstName?.[0] || ''}
                  {post.user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
            </Link>
          </UserHoverCard>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
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
                  onClick={() => onProfileClick?.(post.user?.id || 0)}
                  className="font-semibold text-sm sm:text-[15px] hover:underline text-foreground"
                >
                  {post.user?.firstName} {post.user?.lastName}
                </Link>
              </UserHoverCard>
              {post.user?.isVerified && (
                <Badge variant="secondary" className="h-3.5 px-1 text-[9px]">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.user?.role && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="outline" className="h-3 px-1 text-[9px] border-0">
                    {post.user.role}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Original Post Content */}
        {post.content && (
          <div className="mb-3">
            <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        )}

        {/* Original Post Images */}
        {displayImages.length > 0 && (
          <div
            className={cn(
              'mb-3 rounded-lg overflow-hidden',
              displayImages.length === 1 && 'max-h-[400px]',
              displayImages.length === 2 && 'grid grid-cols-2 gap-1',
              displayImages.length === 3 && 'grid grid-cols-2 gap-1',
              displayImages.length >= 4 && 'grid grid-cols-2 gap-1'
            )}
          >
            {displayImages.map((image: string, imgIndex: number) => (
              <div
                key={`${post.id}-img-${imgIndex}`}
                className={cn(
                  'relative bg-muted',
                  displayImages.length === 1 && 'aspect-auto',
                  displayImages.length === 2 && 'aspect-square',
                  displayImages.length === 3 && imgIndex === 2 && 'col-span-2 aspect-2/1',
                  displayImages.length === 3 && imgIndex < 2 && 'aspect-square',
                  displayImages.length >= 4 && 'aspect-square'
                )}
              >
                <Image
                  src={image}
                  alt={`Shared post image ${imgIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Original Post Engagement */}
        {((post.reactionCount || 0) > 0 ||
          (post.commentCount || 0) > 0 ||
          (post.shareCount || 0) > 0) && (
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              {(post.reactionCount || 0) > 0 && (
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {post.reactionCount}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(post.commentCount || 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                </span>
              )}
              {(post.shareCount || 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Original Post Link */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <Link href={`/hub/social/post/${post.id}`}>
              {t('sharedPost.viewOriginal') || 'View original post'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
