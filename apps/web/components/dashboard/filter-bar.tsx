'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useDashboardUIStore } from '@/stores/dashboard-ui.store';

interface FilterBarProps {
  pageKey: string;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    key: string;
    options: { label: string; value: string }[];
  }[];
  onSearch?: (value: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function FilterBar({
  pageKey,
  searchPlaceholder = 'Search...',
  filters = [],
  onSearch,
  onFilterChange,
}: FilterBarProps) {
  const { filters: pageFilters, updateFilter, clearFilters } = useDashboardUIStore();
  const currentFilters = pageFilters[pageKey] || {};

  const handleSearchChange = (value: string) => {
    updateFilter(pageKey, { search: value });
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...currentFilters, [key]: value };
    updateFilter(pageKey, newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters(pageKey);
    onFilterChange?.({});
  };

  const hasActiveFilters =
    Object.keys(currentFilters).filter((key) => key !== 'search' && currentFilters[key])
      .length > 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={currentFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={currentFilters[filter.key] || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
