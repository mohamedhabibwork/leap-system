'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageCircle, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ReactNode } from 'react';

interface UserHoverCardProps {
  children: ReactNode;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: string;
    bio?: string;
    followerCount?: number;
    isFollowing?: boolean;
    isVerified?: boolean;
  };
  showActions?: boolean;
}

export function UserHoverCard({ children, user, showActions = true }: UserHoverCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 animate-slide-up" side="bottom" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Link href={`/hub/profile/${user.id}`}>
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                href={`/hub/profile/${user.id}`}
                className="font-semibold text-base hover:underline flex items-center gap-1.5"
              >
                {fullName}
                {user.isVerified && (
                  <CheckCircle className="h-4 w-4 text-info fill-info/20" />
                )}
              </Link>
              {user.role && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user.role}
                </Badge>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          {user.followerCount !== undefined && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-semibold">{user.followerCount}</span>
                <span className="text-muted-foreground ms-1">Followers</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={user.isFollowing ? "outline" : "default"}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 me-1.5" />
                {user.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 me-1.5" />
                Message
              </Button>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}