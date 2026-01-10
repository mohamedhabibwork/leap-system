'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { Page } from '@/lib/api/pages';
import { cn } from '@/lib/utils';

interface PageCardProps {
  page: Page;
  onFollow?: (pageId: number) => void;
  onLike?: (pageId: number) => void;
}

/**
 * PageCard Component
 * Display a page card with follow and like actions
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Icons use logical spacing
 * 
 * Theme Support:
 * - Adapts to light/dark theme
 */
export function PageCard({ page, onFollow, onLike }: PageCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {page.coverImage ? (
        <div className="relative w-full h-32">
          <Image
            src={page.coverImage}
            alt={page.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link 
            href={`/hub/pages/${page.id}`}
            className="flex-1 min-w-0"
          >
            <h3 className="font-semibold text-lg truncate hover:underline text-start">
              {page.name}
              {page.isVerified && (
                <CheckCircle2 className="inline h-4 w-4 text-blue-500 ms-1" />
              )}
            </h3>
          </Link>
        </div>

        {page.category && (
          <Badge variant="secondary" className="w-fit">
            {page.category}
          </Badge>
        )}

        {page.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 text-start">
            {page.description}
          </p>
        )}
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{page.followerCount || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(page.id)}
            >
              <Heart className={cn(
                "h-4 w-4",
                page.isFollowing && "fill-current text-red-500"
              )} />
            </Button>
          )}
          {onFollow && (
            <Button
              variant={page.isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={() => onFollow(page.id)}
            >
              {page.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
