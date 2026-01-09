'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { JoinButton } from '@/components/buttons/join-button';
import { ShareButton } from '@/components/buttons/share-button';

interface GroupCardProps {
  group: {
    id: number;
    name: string;
    description?: string;
    coverImage?: string;
    memberCount: number;
    privacy: 'public' | 'private';
    isJoined?: boolean;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function GroupCard({ group, variant = 'grid', showActions = true }: GroupCardProps) {
  const isGrid = variant === 'grid';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex'}`}>
      <Link href={`/hub/social/groups/${group.id}`} className={isGrid ? '' : 'flex-shrink-0'}>
        {group.coverImage ? (
          <Image
            src={group.coverImage}
            alt={group.name}
            width={isGrid ? 400 : 200}
            height={isGrid ? 200 : 150}
            className={`object-cover ${isGrid ? 'w-full h-48' : 'w-48 h-full'} rounded-t-lg`}
          />
        ) : (
          <div
            className={`bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${
              isGrid ? 'h-48' : 'w-48'
            } flex items-center justify-center`}
          >
            <Users className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </Link>

      <div className="flex-1">
        <CardHeader>
          <Link href={`/hub/social/groups/${group.id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary">
              {group.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              {group.privacy === 'private' ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Globe className="w-3 h-3" />
              )}
              {group.privacy}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {group.memberCount} members
            </span>
          </div>
        </CardHeader>

        {group.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {group.description}
            </p>
          </CardContent>
        )}

        {showActions && (
          <CardFooter className="flex items-center justify-between gap-2">
            <JoinButton
              entityType="group"
              entityId={group.id}
              isJoined={group.isJoined}
            />
            <ShareButton
              entityType="group"
              entityId={group.id}
              url={`/hub/social/groups/${group.id}`}
              title={group.name}
            />
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
