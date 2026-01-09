'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth, startOfToday } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

const presets = [
  { label: 'Today', getValue: () => ({ from: startOfToday(), to: startOfToday() }) },
  { label: 'Yesterday', getValue: () => ({ from: subDays(startOfToday(), 1), to: subDays(startOfToday(), 1) }) },
  { label: 'Last 7 days', getValue: () => ({ from: subDays(startOfToday(), 7), to: startOfToday() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(startOfToday(), 30), to: startOfToday() }) },
  { label: 'This month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
];

/**
 * Date range picker component
 * 
 * Features:
 * - Calendar UI
 * - Preset ranges (Today, Yesterday, Last 7 days, Last 30 days, This month, Custom)
 * - Clear button
 * - Time selection (optional in future)
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select date range',
  className,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onChange?.(range);
  };

  const handlePreset = (preset: { from: Date; to: Date }) => {
    handleSelect(preset);
  };

  const handleClear = () => {
    handleSelect(undefined);
  };

  const displayValue = date?.from
    ? date.to
      ? `${format(date.from, 'MMM d, yyyy')} - ${format(date.to, 'MMM d, yyyy')}`
      : format(date.from, 'MMM d, yyyy')
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-3 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handlePreset(preset.getValue())}
              >
                {preset.label}
              </Button>
            ))}
            {date && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm text-destructive"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
