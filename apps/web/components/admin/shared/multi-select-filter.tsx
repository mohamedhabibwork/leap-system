'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Multi-select filter component
 * 
 * Features:
 * - Searchable dropdown
 * - Select all/none
 * - Selected count badge
 * - Clear selection
 * - Keyboard navigation
 */
export function MultiSelectFilter({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleSelectAll = () => {
    onChange?.(options.map((opt) => opt.value));
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center gap-1 flex-1 overflow-hidden">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                <span className="truncate">
                  {selectedLabels.length <= 2
                    ? selectedLabels.join(', ')
                    : `${selectedLabels[0]}, ...`}
                </span>
                {value.length > 1 && (
                  <Badge variant="secondary" className="ml-1">
                    {value.length}
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {/* Select All / Clear All */}
            <div className="flex items-center justify-between p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-8"
              >
                Select All
              </Button>
              {value.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Options */}
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleToggle(option.value)}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                    value.includes(option.value)
                      ? 'bg-primary border-primary'
                      : 'opacity-50'
                  )}
                >
                  {value.includes(option.value) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="flex-1">{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
