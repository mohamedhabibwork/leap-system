'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/lib/hooks/use-api';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  entityType: string;
  entityId: number;
  isFavorited?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function FavoriteButton({
  entityType,
  entityId,
  isFavorited: initialFavorited,
  size = 'sm',
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited || false);
  const { data: session, status } = useSession();
  const toggleFavorite = useToggleFavorite();

  // Sync with prop changes
  useEffect(() => {
    setFavorited(initialFavorited || false);
  }, [initialFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (status === 'loading') {
      toast.info('Please wait...');
      return;
    }

    if (!session?.accessToken) {
      toast.error('Please sign in to add favorites');
      return;
    }

    const prevFavorited = favorited;
    // Optimistic update
    setFavorited(!favorited);

    try {
      const result = await toggleFavorite.mutateAsync({ entityType, entityId });
      // Update based on server response
      if (result?.favorited !== undefined) {
        setFavorited(result.favorited);
      }
      toast.success(result?.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      // Revert on error
      setFavorited(prevFavorited);
      toast.error('Failed to update favorites');
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={toggleFavorite.isPending}
      className={cn('gap-1', favorited && 'text-red-500', className)}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={cn('h-4 w-4 transition-all', favorited && 'fill-current')} />
    </Button>
  );
}
