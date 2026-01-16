'use client';

import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LookupMultiSelectProps {
  typeCode: LookupTypeCode | string;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable multi-select lookup component
 * Allows selecting multiple lookup values
 * Supports localization (AR/EN)
 */
export function LookupMultiSelect({
  typeCode,
  value = [],
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className,
}: LookupMultiSelectProps) {
  const locale = useLocale() as 'en' | 'ar';
  const [open, setOpen] = useState(false);
  const { data: lookups, isLoading, isError } = useLookupsByType(typeCode);

  const handleSelect = (code: string) => {
    const newValue = value.includes(code)
      ? value.filter((v) => v !== code)
      : [...value, code];
    onValueChange?.(newValue);
  };

  const handleRemove = (code: string) => {
    onValueChange?.(value.filter((v) => v !== code));
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (isError || !lookups) {
    return <div className="text-sm text-muted-foreground">Error loading options</div>;
  }

  const selectedLookups = lookups.filter((l) => value.includes(l.code));

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {lookups.map((lookup) => {
                const label = locale === 'ar' && lookup.nameAr ? lookup.nameAr : lookup.nameEn;
                const isSelected = value.includes(lookup.code);
                return (
                  <CommandItem
                    key={lookup.code}
                    value={lookup.code}
                    onSelect={() => handleSelect(lookup.code)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLookups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLookups.map((lookup) => {
            const label = locale === 'ar' && lookup.nameAr ? lookup.nameAr : lookup.nameEn;
            return (
              <Badge key={lookup.code} variant="secondary" className="gap-1">
                {label}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => handleRemove(lookup.code)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
