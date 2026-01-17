'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useSearchSuggestions, useTrendingSearches, useRecentSearches } from '@/lib/hooks/use-api';
import { searchAPI } from '@/lib/api/search';
import { useRouter } from '@/i18n/navigation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
}

/**
 * SearchBar Component
 * Enhanced search input with suggestions, recent searches, and trending topics
 * 
 * RTL/LTR Support:
 * - Search icon positioned with logical properties (start)
 * - Clear button positioned with logical properties (end)
 * - Suggestions dropdown aligns correctly
 * - Text input flows correctly in both directions
 * 
 * Theme Support:
 * - Uses theme-aware colors for input, suggestions
 * - Icons adapt to theme
 * - Hover and focus states visible in both themes
 */
export function SearchBar({ 
  onSearch, 
  placeholder = 'Search...', 
  className,
  autoFocus = false,
  initialQuery = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(
    query,
    5
  );
  const { data: trending } = useTrendingSearches(5);
  const { data: recent } = useRecentSearches(5);

  const showSuggestions = isFocused && (query.length >= 2 || (!query && (recent?.length || trending?.length)));

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    searchAPI.saveRecentSearch(searchQuery);

    // Close dropdown
    setIsOpen(false);
    setIsFocused(false);

    // Call callback or navigate
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/hub/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search Icon */}
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          {/* Input */}
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay to allow clicking suggestions
              setTimeout(() => setIsFocused(false), 200);
            }}
            className="ps-10 pe-10 text-start"
          />

          {/* Clear/Loading */}
          <div className="absolute end-3 top-1/2 -translate-y-1/2">
            {suggestionsLoading && query.length >= 2 ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full start-0 end-0 mt-2 z-50">
          <Command className="rounded-lg border border-border shadow-md bg-popover">
            <CommandList>
              {/* Search Suggestions */}
              {query.length >= 2 && suggestions && suggestions.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionClick(suggestion.query)}
                      className="cursor-pointer"
                    >
                      <Search className="me-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-start">{suggestion.query}</span>
                      {suggestion.count && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.count} results
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Recent Searches */}
              {!query && recent && recent.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recent.map((item, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionClick(item.query)}
                      className="cursor-pointer"
                    >
                      <Clock className="me-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-start">{item.query}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Trending Searches */}
              {!query && trending && trending.length > 0 && (
                <CommandGroup heading="Trending">
                  {trending.map((item, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionClick(item.query)}
                      className="cursor-pointer"
                    >
                      <TrendingUp className="me-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-start">{item.query}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty State */}
              {query.length >= 2 && (!suggestions || suggestions.length === 0) && !suggestionsLoading && (
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No suggestions found</p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
