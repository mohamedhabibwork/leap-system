'use client';

import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SaveButtonProps {
  entityType: 'job' | 'course' | 'event';
  entityId: number;
  isSaved?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function SaveButton({ entityType, entityId, isSaved, size = 'sm' }: SaveButtonProps) {
  const [saved, setSaved] = useState(isSaved || false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const prevSaved = saved;

    // Optimistic update
    setSaved(!saved);

    try {
      // API call to toggle save
      await new Promise((resolve) => setTimeout(resolve, 300)); // Mock API call
      toast.success(saved ? `Removed from saved` : `Saved ${entityType}`);
    } catch (error) {
      // Revert on error
      setSaved(prevSaved);
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={saved ? 'default' : 'ghost'}
      size={size}
      onClick={handleToggle}
      disabled={loading}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
    </Button>
  );
}
