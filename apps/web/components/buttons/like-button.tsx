'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      // API call to toggle like
      await new Promise((resolve) => setTimeout(resolve, 300)); // Mock API call
    } catch (error) {
      // Revert on error
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={liked ? 'default' : 'ghost'}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn('gap-1', liked && 'text-red-500')}
    >
      <Heart
        className={cn('h-4 w-4', liked && 'fill-current')}
      />
      {showCount && count > 0 && <span>{count}</span>}
    </Button>
  );
}
