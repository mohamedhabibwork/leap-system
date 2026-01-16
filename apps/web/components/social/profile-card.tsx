'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { Users, Eye, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConnections, useBookmarks } from '@/lib/hooks/use-api';
import apiClient from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

interface ProfileCardProps {
  className?: string;
}

export function ProfileCard({ className }: ProfileCardProps) {
  const t = useTranslations('social');
  const { user } = useAuthStore();

  // Fetch real stats from API
  const { data: connections } = useConnections();
  const { data: bookmarks } = useBookmarks();
  const { data: connectionStats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/users/connections/stats');
        return res.data || { totalConnections: 0, profileViews: 0 };
      } catch (error) {
        return { totalConnections: 0, profileViews: 0 };
      }
    },
    placeholderData: { totalConnections: 0, profileViews: 0 },
  });

  if (!user) return null;

  const stats = {
    connections: connections?.data?.length || connectionStats?.totalConnections || 0,
    profileViews: connectionStats?.profileViews || 0,
    savedItems: bookmarks?.data?.length || 0,
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Cover Photo */}
      <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600" />
      
      {/* Profile Section */}
      <CardHeader className="relative pb-0 pt-0">
        <div className="flex flex-col items-center -mt-10">
          <Link href={`/hub/users/${user.id}`} className="group">
            <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <Link 
            href={`/hub/users/${user.id}`}
            className="mt-3 text-center hover:underline"
          >
            <h3 className="font-semibold text-base">
              {user.firstName} {user.lastName}
            </h3>
          </Link>
          
          {user.role && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {user.role}
            </Badge>
          )}
          
          {user.bio && (
            <p className="text-xs text-muted-foreground mt-2 text-center line-clamp-2 px-4">
              {user.bio}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* Stats */}
        <div className="space-y-2">
          <Link 
            href="/hub/social/connections"
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground group-hover:text-foreground">
                {t('profileCard.connections')}
              </span>
            </div>
            <span className="font-semibold text-sm">{stats.connections}</span>
          </Link>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('profileCard.profileViews')}
              </span>
            </div>
            <span className="font-semibold text-sm">{stats.profileViews}</span>
          </div>

          <Link 
            href="/hub/saved"
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-2 text-sm">
              <Bookmark className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground group-hover:text-foreground">
                {t('profileCard.saved')}
              </span>
            </div>
            <span className="font-semibold text-sm">{stats.savedItems}</span>
          </Link>
        </div>

        {/* Premium CTA (optional) */}
        <div className="pt-3 border-t">
          <Link 
            href="/premium"
            className="block text-xs text-center py-2 hover:bg-muted rounded-lg transition-colors"
          >
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              ⭐ {t('profileCard.tryPremium')}
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
