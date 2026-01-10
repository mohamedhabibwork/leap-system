'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTogglePostLike, useReaction } from '@/lib/hooks/use-api';

interface LikeButtonProps {
  entityType: string;
  entityId: number;
  isLiked?: boolean;
  likeCount?: number;
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
}

export function LikeButton({
  entityType,
  entityId,
  isLiked,
  likeCount = 0,
  size = 'sm',
  showCount = true,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked || false);
  const [count, setCount] = useState(likeCount);

  // Use appropriate hook based on entity type
  const togglePostLike = useTogglePostLike();
  const toggleReaction = useReaction();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      if (entityType === 'post') {
        // Use dedicated post like hook
        await togglePostLike.mutateAsync(entityId);
      } else {
        // Use generic reaction hook for other entity types
        await toggleReaction.mutateAsync({ entityType, entityId });
      }
    } catch (error) {
      // Revert on error
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error('Failed to update like');
      console.error('Like error:', error);
    }
  };

  const isLoading = togglePostLike.isPending || toggleReaction.isPending;

  return (
    <Button
      variant={liked ? 'default' : 'ghost'}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn('gap-1', liked && 'text-red-500')}
    >
      <Heart
        className={cn('h-4 w-4', liked && 'fill-current')}
      />
      {showCount && count > 0 && <span>{count}</span>}
    </Button>
  );
}
