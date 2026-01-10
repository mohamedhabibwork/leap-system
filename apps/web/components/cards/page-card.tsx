'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { LikeButton } from '@/components/buttons/like-button';
import { FollowButton } from '@/components/buttons/follow-button';
import { ShareButton } from '@/components/buttons/share-button';

interface PageCardProps {
  page: {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    category: string;
    followerCount: number;
    isFollowing?: boolean;
    isLiked?: boolean;
    likeCount?: number;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function PageCard({ page, variant = 'grid', showActions = true }: PageCardProps) {
  const isGrid = variant === 'grid';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex'}`}>
      <Link href={`/hub/social/pages/${page.id}`} className={isGrid ? '' : 'flex-shrink-0'}>
        {page.logo ? (
          <Image
            src={page.logo}
            alt={page.name}
            width={isGrid ? 400 : 200}
            height={isGrid ? 200 : 150}
            className={`object-cover ${isGrid ? 'w-full h-48' : 'w-48 h-full'} rounded-t-lg`}
          />
        ) : (
          <div
            className={`bg-gradient-to-br from-green-500/20 to-blue-500/20 ${
              isGrid ? 'h-48' : 'w-48'
            } flex items-center justify-center`}
          >
            <span className="text-5xl">📄</span>
          </div>
        )}
      </Link>

      <div className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/hub/social/pages/${page.id}`} className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary">
                {page.name}
              </h3>
            </Link>
            {showActions && (
              <LikeButton
                entityType="page"
                entityId={page.id}
                isLiked={page.isLiked}
                likeCount={page.likeCount}
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{page.category}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {page.followerCount} followers
            </span>
          </div>
        </CardHeader>

        {page.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {page.description}
            </p>
          </CardContent>
        )}

        {showActions && (
          <CardFooter className="flex items-center justify-between gap-2">
            <FollowButton
              entityType="page"
              entityId={page.id}
              isFollowing={page.isFollowing}
            />
            <ShareButton
              entityType="page"
              entityId={page.id}
              url={`/hub/social/pages/${page.id}`}
              title={page.name}
            />
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
