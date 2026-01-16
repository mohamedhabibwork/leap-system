'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFollowPage, useUnfollowPage, useFollowUser, useUnfollowUser } from '@/lib/hooks/use-api';

interface FollowButtonProps {
  entityType: 'user' | 'page';
  entityId: number;
  isFollowing?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({
  entityType,
  entityId,
  isFollowing,
  size = 'sm',
}: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing || false);
  const [isHovered, setIsHovered] = useState(false);

  const followPageMutation = useFollowPage();
  const unfollowPageMutation = useUnfollowPage();
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prevFollowing = following;
    setFollowing(!following);

    try {
      if (entityType === 'page') {
        if (following) {
          await unfollowPageMutation.mutateAsync(entityId);
        } else {
          await followPageMutation.mutateAsync(entityId);
        }
      } else {
        if (following) {
          await unfollowUserMutation.mutateAsync(entityId);
        } else {
          await followUserMutation.mutateAsync(entityId);
        }
      }
      toast.success(following ? `Unfollowed ${entityType}` : `Following ${entityType}`);
    } catch (error) {
      setFollowing(prevFollowing);
      toast.error(`Failed to ${following ? 'unfollow' : 'follow'}`);
    }
  };

  const loading = followPageMutation.isPending || unfollowPageMutation.isPending || 
                  followUserMutation.isPending || unfollowUserMutation.isPending;

  return (
    <Button
      variant={following ? 'secondary' : 'default'}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {following ? (
        <>
          <UserCheck className="mr-2 h-4 w-4" />
          {isHovered ? 'Unfollow' : 'Following'}
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
