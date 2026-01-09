'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface UserCardProps {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  roleId: number;
  isOnline?: boolean;
  stats?: {
    courses?: number;
    followers?: number;
  };
}

export function UserCard({ 
  id, 
  username, 
  firstName, 
  lastName, 
  bio, 
  avatarUrl, 
  roleId, 
  isOnline,
  stats 
}: UserCardProps) {
  const getRoleBadge = (roleId: number) => {
    const roles: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      1: { label: 'Admin', variant: 'destructive' },
      2: { label: 'Instructor', variant: 'default' },
      3: { label: 'Student', variant: 'secondary' },
    };
    return roles[roleId] || { label: 'User', variant: 'secondary' };
  };

  const roleBadge = getRoleBadge(roleId);
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || username[0].toUpperCase();
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || username;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="space-y-1 w-full">
            <h3 className="font-semibold text-lg truncate">{fullName}</h3>
            <p className="text-sm text-muted-foreground truncate">@{username}</p>
            <Badge variant={roleBadge.variant} className="mt-2">
              {roleBadge.label}
            </Badge>
          </div>

          {bio && (
            <p className="text-sm text-gray-600 line-clamp-2">{bio}</p>
          )}

          {stats && (
            <div className="flex gap-4 text-sm">
              {stats.courses !== undefined && (
                <div>
                  <div className="font-semibold">{stats.courses}</div>
                  <div className="text-muted-foreground">Courses</div>
                </div>
              )}
              {stats.followers !== undefined && (
                <div>
                  <div className="font-semibold">{stats.followers}</div>
                  <div className="text-muted-foreground">Followers</div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Link href={`/hub/users/${id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
