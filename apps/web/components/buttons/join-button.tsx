'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useJoinGroup, useLeaveGroup } from '@/lib/hooks/use-api';

interface JoinButtonProps {
  entityType: 'group' | 'event';
  entityId: number;
  isJoined?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export function JoinButton({ entityType, entityId, isJoined, onJoin, onLeave }: JoinButtonProps) {
  const [joined, setJoined] = useState(isJoined || false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Hooks for group operations
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const handleJoin = async () => {
    try {
      if (entityType === 'group') {
        await joinGroup.mutateAsync(entityId);
        setJoined(true);
        toast.success('Successfully joined group!');
        onJoin?.();
      } else if (entityType === 'event') {
        // For events, we'll need to implement event-specific hooks later
        // For now, use a generic approach or show a message
        toast.info('Event joining will be implemented soon');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || `Failed to join ${entityType}`;
      toast.error(errorMessage);
      console.error('Join error:', error);
    }
  };

  const handleLeave = async () => {
    try {
      if (entityType === 'group') {
        await leaveGroup.mutateAsync(entityId);
        setJoined(false);
        toast.success('Left group');
        onLeave?.();
        setShowLeaveDialog(false);
      } else if (entityType === 'event') {
        // For events, we'll need to implement event-specific hooks later
        toast.info('Event leaving will be implemented soon');
        setShowLeaveDialog(false);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || `Failed to leave ${entityType}`;
      toast.error(errorMessage);
      console.error('Leave error:', error);
    }
  };

  const isLoading = joinGroup.isPending || leaveGroup.isPending;

  if (joined) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLeaveDialog(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Clock className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="mr-2 h-4 w-4" />
          )}
          Leave
        </Button>

        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave {entityType}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this {entityType}? You can always rejoin later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} disabled={isLoading}>
                {isLoading ? 'Leaving...' : 'Leave'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button size="sm" onClick={handleJoin} disabled={isLoading}>
      {isLoading ? (
        <Clock className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Join
    </Button>
  );
}
