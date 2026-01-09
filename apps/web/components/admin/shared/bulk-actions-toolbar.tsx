'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface BulkAction {
  label: string;
  value: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (action: string) => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted p-2">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Bulk Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.value}
              onClick={() => onAction(action.value)}
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </div>
  );
}
