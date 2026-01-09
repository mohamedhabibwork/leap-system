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

interface JoinButtonProps {
  entityType: 'group' | 'event';
  entityId: number;
  isJoined?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export function JoinButton({ entityType, entityId, isJoined, onJoin, onLeave }: JoinButtonProps) {
  const [joined, setJoined] = useState(isJoined || false);
  const [loading, setLoading] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      // API call to join
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock API call
      setJoined(true);
      toast.success(`Successfully joined ${entityType}!`);
      onJoin?.();
    } catch (error) {
      toast.error(`Failed to join ${entityType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    try {
      // API call to leave
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock API call
      setJoined(false);
      toast.success(`Left ${entityType}`);
      onLeave?.();
      setShowLeaveDialog(false);
    } catch (error) {
      toast.error(`Failed to leave ${entityType}`);
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLeaveDialog(true)}
          disabled={loading}
        >
          {loading ? (
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
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button size="sm" onClick={handleJoin} disabled={loading}>
      {loading ? (
        <Clock className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Join
    </Button>
  );
}
