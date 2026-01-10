'use client';

import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaveJob, useUnsaveJob, useToggleFavorite } from '@/lib/hooks/use-api';

interface SaveButtonProps {
  entityType: 'job' | 'course' | 'event';
  entityId: number;
  isSaved?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

/**
 * SaveButton Component
 * Allows users to save/bookmark jobs, courses, and events
 * 
 * RTL/LTR Support:
 * - Icon-only button works in both directions
 * - Tooltip positioning (if added) should use logical placement
 * 
 * Theme Support:
 * - Uses theme-aware button variants
 * - Icon fill changes based on saved state
 * - Hover states visible in both themes
 */
export function SaveButton({ entityType, entityId, isSaved, size = 'sm' }: SaveButtonProps) {
  // Use job-specific hooks for jobs
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();
  
  // Use generic favorite hook for courses and events
  const toggleFavoriteMutation = useToggleFavorite();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (entityType === 'job') {
        // Jobs have specific save/unsave endpoints
        if (isSaved) {
          await unsaveJobMutation.mutateAsync(entityId);
        } else {
          await saveJobMutation.mutateAsync(entityId);
        }
      } else {
        // Courses and events use the generic favorites endpoint
        await toggleFavoriteMutation.mutateAsync({
          entityType,
          entityId,
        });
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to toggle save:', error);
    }
  };

  const isPending = 
    saveJobMutation.isPending || 
    unsaveJobMutation.isPending || 
    toggleFavoriteMutation.isPending;

  return (
    <Button
      variant={isSaved ? 'default' : 'ghost'}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className="shrink-0"
      aria-label={isSaved ? `Remove ${entityType} from saved` : `Save ${entityType}`}
    >
      <Bookmark 
        className={cn(
          'h-4 w-4', 
          isSaved && 'fill-current'
        )} 
      />
    </Button>
  );
}
