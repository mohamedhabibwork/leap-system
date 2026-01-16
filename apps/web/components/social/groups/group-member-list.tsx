'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Shield, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api/client';
import { useGroupMembers } from '@/lib/hooks/use-api';
import { GroupMember } from '@/lib/api/groups';

interface GroupMemberListProps {
  groupId: number;
  showSearch?: boolean;
  limit?: number;
}

export function GroupMemberList({
  groupId,
  showSearch = true,
  limit,
}: GroupMemberListProps) {
  const t = useTranslations('groups');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch group members
  const { data: members, isLoading } = useGroupMembers(groupId, { search: searchQuery });

  const displayedMembers = limit ? (members?.data as GroupMember[])?.slice(0, limit) : members?.data;
  const totalMembers = members?.meta?.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchMembers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
      )}

      <div className="space-y-3">
        {displayedMembers.map((member: any) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/hub/users/${member.id}`}>
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback>
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hub/users/${member.id}`}
                        className="font-medium hover:underline"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                      {member.role === 'admin' && (
                        <Badge variant="default" className="text-xs">
                          <Crown className="h-3 w-3 me-1" />
                          Admin
                        </Badge>
                      )}
                      {member.role === 'moderator' && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 me-1" />
                          Moderator
                        </Badge>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                <Button size="sm" variant="outline" asChild>
                  <Link href={`/hub/users/${member.id}`}>
                    {t('viewProfile')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {limit && members.length > limit && (
        <Button variant="outline" className="w-full">
          {t('viewAllMembers', { count: members.length })}
        </Button>
      )}
    </div>
  );
}
