'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, SlidersHorizontal } from 'lucide-react';
import { SearchParams } from '@/lib/api/search';

interface SearchFiltersProps {
  filters: Partial<SearchParams>;
  onFiltersChange: (filters: Partial<SearchParams>) => void;
  facets?: {
    types: Record<string, number>;
    categories?: Record<string, number>;
  };
}

/**
 * SearchFilters Component
 * Displays and manages search filters
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Badges and buttons flow correctly
 * - Select dropdowns align properly
 * 
 * Theme Support:
 * - Card backgrounds adapt to theme
 * - Badges use theme colors
 * - Form controls work in both themes
 */
export function SearchFilters({ filters, onFiltersChange, facets }: SearchFiltersProps) {
  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : type as any,
    });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({
      ...filters,
      sort: sort as any,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      query: filters.query,
    });
  };

  const hasActiveFilters = filters.type || filters.sort !== 'relevance' || filters.filters;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-start block">
            Content Type
          </label>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="text-start">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="user">
                Users
                {facets?.types?.user && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.user})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="post">
                Posts
                {facets?.types?.post && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.post})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="group">
                Groups
                {facets?.types?.group && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.group})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="page">
                Pages
                {facets?.types?.page && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.page})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="event">
                Events
                {facets?.types?.event && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.event})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="job">
                Jobs
                {facets?.types?.job && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.job})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="course">
                Courses
                {facets?.types?.course && (
                  <span className="ms-2 text-muted-foreground">
                    ({facets.types.course})
                  </span>
                )}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-start block">
            Sort By
          </label>
          <Select
            value={filters.sort || 'relevance'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="text-start">
              <SelectValue placeholder="Relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="date">Most Recent</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              {filters.type && filters.type !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.type}
                  <button
                    onClick={() => handleTypeChange('all')}
                    className="ms-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
