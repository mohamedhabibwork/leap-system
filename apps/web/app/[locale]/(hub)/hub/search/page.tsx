'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/search-bar';
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from '@/components/search/search-filters';
import { useGlobalSearch } from '@/lib/hooks/use-api';
import type { SearchParams as SearchParamsType } from '@/lib/api/search';

/**
 * Search Page
 * Global search with filters and results
 * 
 * RTL/LTR Support:
 * - Grid layout adapts to reading direction
 * - Search bar and filters flow correctly
 * 
 * Theme Support:
 * - All components use theme-aware colors
 * - Results visible in both themes
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<Partial<SearchParamsType>>({
    query: queryParam,
    type: 'all',
    sort: 'relevance',
  });

  // Update filters when URL changes
  useEffect(() => {
    if (queryParam) {
      setFilters(prev => ({ ...prev, query: queryParam }));
    }
  }, [queryParam]);

  const { data: searchData, isLoading } = useGlobalSearch(filters as SearchParamsType);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for anything..."
          autoFocus
        />
      </div>

      {/* Results Count */}
      {searchData && (
        <div className="text-sm text-muted-foreground text-start">
          {searchData.total} results for "{filters.query}"
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            facets={searchData?.facets}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <SearchResults
            results={searchData?.results || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
