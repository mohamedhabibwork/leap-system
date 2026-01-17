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
import { useTranslations } from 'next-intl';

export default function SearchPage() {
  const t = useTranslations('search');
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<SearchParamsType>({
    query: queryParam,
    type: 'all',
    sort: 'relevance',
    limit: 20,
    offset: 0,
  });

  // Update filters when query param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== filters.query) {
      setFilters(prev => ({ ...prev, query: q, offset: 0 }));
    }
  }, [searchParams, filters.query]);

  const { data: searchData, isLoading } = useGlobalSearch(filters);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query, offset: 0 }));
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="container max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchBar
          onSearch={handleSearch}
          placeholder={t('placeholder')}
          autoFocus={!queryParam}
          initialQuery={queryParam}
        />
      </div>

      {/* Only show results section if there's a query */}
      {filters.query ? (
        <>
          {/* Results Count */}
          {searchData && (
            <div className="text-sm text-muted-foreground text-start px-1">
              {t('results', { count: searchData.total, query: filters.query })}
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
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
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {t('placeholder')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a search query to find courses, users, posts, events, jobs, and more
          </p>
        </div>
      )}
    </div>
  );
}
