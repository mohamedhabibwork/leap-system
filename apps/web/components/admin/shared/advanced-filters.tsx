'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from './date-range-picker';
import { MultiSelectFilter } from './multi-select-filter';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: any;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * Advanced filter panel component
 * 
 * Features:
 * - Collapsible filter panel
 * - Multiple filter types (text, select, multi-select, date range, number, boolean)
 * - Filter presets (saved filters) - coming soon
 * - Clear all filters
 * - Active filter chips
 * - Filter count indicator
 */
export function AdvancedFilters({
  fields,
  values,
  onChange,
  onApply,
  onReset,
  className,
  defaultExpanded = false,
}: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const handleClear = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const handleReset = () => {
    onChange({});
    onReset?.();
  };

  const activeFilters = Object.entries(values).filter(([_, value]) => {
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  const renderFilterField = (field: FilterField) => {
    const value = values[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={field.placeholder || field.label}
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || field.label}
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiSelect':
        return (
          <MultiSelectFilter
            options={field.options || []}
            value={value || []}
            onChange={(newValue) => handleChange(field.key, newValue)}
            placeholder={field.placeholder}
          />
        );

      case 'dateRange':
        return (
          <DateRangePicker
            value={value}
            onChange={(range) => handleChange(field.key, range)}
            placeholder={field.placeholder}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleChange(field.key, checked)}
            />
            <Label>{value ? 'Yes' : 'No'}</Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {activeFilters.length > 0 && (
              <Badge variant="secondary">{activeFilters.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.map(([key, value]) => {
              const field = fields.find((f) => f.key === key);
              if (!field) return null;

              let displayValue: string;

              if (field.type === 'dateRange' && value?.from) {
                displayValue = value.to
                  ? `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
                  : value.from.toLocaleDateString();
              } else if (field.type === 'multiSelect' && Array.isArray(value)) {
                displayValue = `${value.length} selected`;
              } else if (field.type === 'boolean') {
                displayValue = value ? 'Yes' : 'No';
              } else {
                displayValue = String(value);
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="font-medium">{field.label}:</span>
                  <span>{displayValue}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleClear(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {renderFilterField(field)}
              </div>
            ))}
          </div>

          {onApply && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={onApply}>Apply Filters</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
