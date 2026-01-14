'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectionsAPI } from '@/lib/api/connections';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ConnectionButtonProps {
  userId: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ConnectionButton({
  userId,
  variant = 'default',
  size = 'default',
  showLabel = true,
  className,
}: ConnectionButtonProps) {
  const t = useTranslations('connections');
  const queryClient = useQueryClient();

  // Get connection status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['connection-status', userId],
    queryFn: () => connectionsAPI.getConnectionStatus(userId),
    staleTime: 30000, // 30 seconds
  });

  const status = statusData?.status || 'none';
  const connectionId = statusData?.connectionId;
  const requestId = statusData?.requestId;

  // Send connection request
  const sendRequestMutation = useMutation({
    mutationFn: () => connectionsAPI.sendRequest({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(t('requestSent'));
    },
    onError: () => {
      toast.error(t('requestFailed'));
    },
  });

  // Remove connection
  const removeConnectionMutation = useMutation({
    mutationFn: () => connectionsAPI.removeConnection(connectionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(t('connectionRemoved'));
    },
    onError: () => {
      toast.error(t('removeFailed'));
    },
  });

  // Accept connection request
  const acceptRequestMutation = useMutation({
    mutationFn: () => connectionsAPI.acceptRequest(requestId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success(t('requestAccepted'));
    },
    onError: () => {
      toast.error(t('acceptFailed'));
    },
  });

  const handleClick = () => {
    if (status === 'none') {
      sendRequestMutation.mutate();
    } else if (status === 'connected') {
      if (window.confirm(t('confirmRemove'))) {
        removeConnectionMutation.mutate();
      }
    }
  };

  const handleAccept = () => {
    acceptRequestMutation.mutate();
  };

  const isProcessing =
    sendRequestMutation.isPending ||
    removeConnectionMutation.isPending ||
    acceptRequestMutation.isPending;

  // Render based on connection status
  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Clock className="h-4 w-4" />
        {showLabel && <span className="ms-2">{t('loading')}</span>}
      </Button>
    );
  }

  if (status === 'pending') {
    // Check if current user received the request
    if (requestId) {
      return (
        <div className={cn('flex gap-2', className)}>
          <Button
            variant="default"
            size={size}
            onClick={handleAccept}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4" />
            {showLabel && <span className="ms-2">{t('accept')}</span>}
          </Button>
          <Button variant="outline" size={size} disabled>
            <Clock className="h-4 w-4" />
            {showLabel && <span className="ms-2">{t('pending')}</span>}
          </Button>
        </div>
      );
    }

    // Current user sent the request
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Clock className="h-4 w-4" />
        {showLabel && <span className="ms-2">{t('pending')}</span>}
      </Button>
    );
  }

  if (status === 'connected') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleClick}
        disabled={isProcessing}
        className={className}
      >
        <Check className="h-4 w-4 text-green-600" />
        {showLabel && <span className="ms-2">{t('connected')}</span>}
      </Button>
    );
  }

  // Default: Not connected
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isProcessing}
      className={className}
    >
      <UserPlus className="h-4 w-4" />
      {showLabel && <span className="ms-2">{t('connect')}</span>}
    </Button>
  );
}
