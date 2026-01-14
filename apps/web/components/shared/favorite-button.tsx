'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/lib/hooks/use-api';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  entityType: string;
  entityId: number;
  isFavorited?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function FavoriteButton({
  entityType,
  entityId,
  isFavorited,
  size = 'sm',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited || false);
  const { data: session, status } = useSession();
  const toggleFavorite = useToggleFavorite();

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
    setFavorited(!favorited);

    try {
      await toggleFavorite.mutateAsync({ entityType, entityId });
      toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      setFavorited(prevFavorited);
      toast.error('Failed to update favorites');
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      className={cn('gap-1', favorited && 'text-red-500')}
    >
      <Heart className={cn('h-4 w-4', favorited && 'fill-current')} />
    </Button>
  );
}
