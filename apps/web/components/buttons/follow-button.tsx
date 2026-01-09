'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const prevFollowing = following;

    // Optimistic update
    setFollowing(!following);

    try {
      // API call to toggle follow
      await new Promise((resolve) => setTimeout(resolve, 300)); // Mock API call
      toast.success(following ? `Unfollowed ${entityType}` : `Following ${entityType}`);
    } catch (error) {
      // Revert on error
      setFollowing(prevFollowing);
      toast.error(`Failed to ${following ? 'unfollow' : 'follow'}`);
    } finally {
      setLoading(false);
    }
  };

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
