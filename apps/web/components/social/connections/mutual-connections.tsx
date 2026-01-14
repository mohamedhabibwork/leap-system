'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { connectionsAPI } from '@/lib/api/connections';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MutualConnectionsProps {
  userId: number;
  limit?: number;
  showCount?: boolean;
  className?: string;
}

export function MutualConnections({
  userId,
  limit = 3,
  showCount = true,
  className,
}: MutualConnectionsProps) {
  const t = useTranslations('connections');

  const { data, isLoading } = useQuery({
    queryKey: ['mutual-connections', userId],
    queryFn: () => connectionsAPI.getMutualConnections(userId),
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Users className="h-4 w-4" />
        <span>{t('loadingMutual')}</span>
      </div>
    );
  }

  const mutualConnections = data?.data || [];
  const total = data?.total || 0;

  if (total === 0) {
    return null;
  }

  const displayedConnections = mutualConnections.slice(0, limit);
  const remaining = Math.max(0, total - limit);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Avatars */}
      <div className="flex -space-x-2">
        {displayedConnections.map((connection) => (
          <Link
            key={connection.id}
            href={`/hub/users/${connection.id}`}
            className="relative hover:z-10"
          >
            <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-muted hover:ring-primary transition-all">
              <AvatarImage src={connection.avatar} alt={`${connection.firstName} ${connection.lastName}`} />
              <AvatarFallback className="text-xs">
                {connection.firstName?.[0]}
                {connection.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        ))}
      </div>

      {/* Count Text */}
      {showCount && (
        <Link
          href={`/hub/users/${userId}/mutual-connections`}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {total === 1
            ? t('oneMutualConnection')
            : remaining > 0
            ? t('mutualConnectionsWithMore', { count: total, remaining })
            : t('mutualConnections', { count: total })}
        </Link>
      )}
    </div>
  );
}

// Standalone list view
export function MutualConnectionsList({ userId }: { userId: number }) {
  const t = useTranslations('connections');

  const { data, isLoading } = useQuery({
    queryKey: ['mutual-connections', userId],
    queryFn: () => connectionsAPI.getMutualConnections(userId),
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>;
  }

  const mutualConnections = data?.data || [];

  if (mutualConnections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noMutualConnections')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mutualConnections.map((connection) => (
        <Link
          key={connection.id}
          href={`/hub/users/${connection.id}`}
          className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={connection.avatar} alt={`${connection.firstName} ${connection.lastName}`} />
            <AvatarFallback>
              {connection.firstName?.[0]}
              {connection.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {connection.firstName} {connection.lastName}
            </p>
            {connection.headline && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {connection.headline}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
