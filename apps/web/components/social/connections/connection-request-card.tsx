'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsAPI, type ConnectionRequest } from '@/lib/api/connections';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
}

export function ConnectionRequestCard({ request }: ConnectionRequestCardProps) {
  const t = useTranslations('connections');
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => connectionsAPI.acceptRequest(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] });
      toast.success(t('requestAccepted'));
    },
    onError: () => {
      toast.error(t('acceptFailed'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => connectionsAPI.rejectRequest(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] });
      toast.success(t('requestRejected'));
    },
    onError: () => {
      toast.error(t('rejectFailed'));
    },
  });

  const user = request.fromUser;
  if (!user) return null;

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link href={`/hub/users/${user.id}`}>
            <Avatar className="h-16 w-16 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/hub/users/${user.id}`}
              className="font-semibold hover:underline inline-flex items-center gap-2"
            >
              {user.firstName} {user.lastName}
            </Link>
            {user.role && (
              <Badge variant="secondary" className="ms-2 text-xs">
                {user.role}
              </Badge>
            )}

            {user.headline && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {user.headline}
              </p>
            )}

            {user.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}

            {request.message && (
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <p className="text-sm italic">"{request.message}"</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate()}
                disabled={isProcessing}
              >
                <Check className="h-4 w-4 me-2" />
                {t('accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectMutation.mutate()}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 me-2" />
                {t('reject')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
