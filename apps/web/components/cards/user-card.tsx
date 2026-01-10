'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FollowButton } from '@/components/buttons/follow-button';
import { MessageButton } from '@/components/buttons/message-button';

interface UserCardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    bio?: string;
    role: 'admin' | 'instructor' | 'user';
    isFollowing?: boolean;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function UserCard({ user, variant = 'grid', showActions = true }: UserCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const isGrid = variant === 'grid';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'instructor':
        return <Badge variant="default">Instructor</Badge>;
      default:
        return null;
    }
  };
  console.log({user});
  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex items-center'}`}>
      <CardContent className={`${isGrid ? 'pt-6' : 'py-4'} ${isGrid ? '' : 'flex items-center gap-4 flex-1'}`}>
        <Link
          href={`/hub/social/profile/${user.id}`}
          className={`flex ${isGrid ? 'flex-col items-center text-center' : 'items-center gap-3'}`}
        >
          <Avatar className={isGrid ? 'w-20 h-20' : 'w-12 h-12'}>
            <AvatarImage src={user.avatar} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className={isGrid ? 'mt-3' : ''}>
            <h3 className="font-semibold hover:text-primary">{fullName}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
            )}
            <div className="mt-2">{getRoleBadge(user.role)}</div>
          </div>
        </Link>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 justify-center">
          <MessageButton userId={user.id} userName={fullName} />
          <FollowButton
            entityType="user"
            entityId={user.id}
            isFollowing={user.isFollowing}
          />
        </CardFooter>
      )}
    </Card>
  );
}
