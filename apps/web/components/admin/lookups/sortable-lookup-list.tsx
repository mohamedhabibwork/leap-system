'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragHandle } from '../shared/drag-handle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, Pencil, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface LookupItem {
  id: number;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  isActive: boolean;
}

interface SortableLookupListProps {
  items: LookupItem[];
  onReorder: (items: LookupItem[]) => Promise<void>;
  onToggleActive?: (id: number, isActive: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

/**
 * Sortable list component for lookups with drag-and-drop
 * 
 * Features:
 * - Vertical sorting with smooth animations
 * - Visual drag handles
 * - Active item highlighting
 * - Touch support for mobile
 * - Accessibility (keyboard navigation)
 * - Auto-scroll during drag
 * - Optimistic updates
 */
export function SortableLookupList({
  items,
  onReorder,
  onToggleActive,
  onEdit,
  onDelete,
  className,
}: SortableLookupListProps) {
  const [localItems, setLocalItems] = useState(items);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(localItems, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          sortOrder: index + 1,
        })
      );

      // Optimistic update
      setLocalItems(reorderedItems);

      // Persist to backend
      try {
        setIsSaving(true);
        await onReorder(reorderedItems);
      } catch (error) {
        // Revert on error
        setLocalItems(items);
        console.error('Failed to reorder items:', error);
      } finally {
        setIsSaving(false);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = localItems.find((item) => item.id === activeId);

  return (
    <div className={cn('space-y-4', className)}>
      {isSaving && (
        <div className="text-sm text-muted-foreground">
          Saving order...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={localItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onToggleActive={onToggleActive}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <LookupItemCard item={activeItem} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface SortableItemProps {
  item: LookupItem;
  onToggleActive?: (id: number, isActive: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function SortableItem({ item, onToggleActive, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LookupItemCard
        item={item}
        dragHandleProps={{ listeners, attributes }}
        onToggleActive={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}

interface LookupItemCardProps {
  item: LookupItem;
  dragHandleProps?: {
    listeners: any;
    attributes: any;
  };
  onToggleActive?: (id: number, isActive: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isDragging?: boolean;
}

function LookupItemCard({
  item,
  dragHandleProps,
  onToggleActive,
  isDragging,
}: LookupItemCardProps) {
  return (
    <Card
      className={cn(
        'p-4 flex items-center gap-4 cursor-default transition-all',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <DragHandle
          listeners={dragHandleProps.listeners}
          attributes={dragHandleProps.attributes}
        />
      )}

      {/* Sort Order Badge */}
      <div className="flex-shrink-0">
        <Badge variant="outline" className="w-10 h-10 flex items-center justify-center">
          {item.sortOrder}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium truncate">{item.nameEn}</h4>
            {item.nameAr && (
              <p className="text-sm text-muted-foreground truncate" dir="rtl">
                {item.nameAr}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            {item.isActive ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Inactive
              </Badge>
            )}

            <div className="flex items-center gap-2">
              {onToggleActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleActive(item.id, !item.isActive)}
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              )}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onToggleActive && (
                      <DropdownMenuItem onClick={() => onToggleActive(item.id, !item.isActive)}>
                        {item.isActive ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
