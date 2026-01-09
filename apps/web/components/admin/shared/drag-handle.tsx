'use client';

import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragHandleProps {
  className?: string;
  listeners?: any;
  attributes?: any;
}

/**
 * Visual indicator for draggable items
 */
export function DragHandle({ className, listeners, attributes }: DragHandleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-grab active:cursor-grabbing',
        'text-gray-400 hover:text-gray-600 transition-colors',
        className
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-5 w-5" />
    </div>
  );
}
