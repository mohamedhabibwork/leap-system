'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostComments } from '@/components/social/post-comments';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { UserHoverCard } from '@/components/shared/user-hover-card';

interface PostCommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: number;
    content: string;
    images?: string[];
    createdAt: string;
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
  };
}

export function PostCommentsModal({ open, onOpenChange, post }: PostCommentsModalProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* Post Content */}
          <Card className="mb-4">
          <CardHeader>
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
                <Link href={`/hub/social/profile/${post.user?.id}`}>
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
            {post.images && post.images.length > 0 && (() => {
              const images = post.images;
              const imagesLength = images.length;
              return (
                <div className={`mt-4 grid gap-2 ${
                  imagesLength === 1 ? 'grid-cols-1' :
                  imagesLength === 2 ? 'grid-cols-2' :
                  imagesLength === 3 ? 'grid-cols-2 sm:grid-cols-3' :
                  'grid-cols-2'
                }`}>
                  {images.slice(0, 4).map((image: string, imgIndex: number) => (
                    <div 
                      key={`${post.id}-img-${imgIndex}`} 
                      className={`relative overflow-hidden rounded-lg ${
                        imagesLength === 1 ? 'aspect-video' : 'aspect-square'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Post image ${imgIndex + 1}`}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {imgIndex === 3 && imagesLength > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-lg sm:text-2xl font-bold">
                            +{imagesLength - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

          {/* Comments Section */}
          <PostComments
            postId={post.id}
            userId={post.user?.id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
