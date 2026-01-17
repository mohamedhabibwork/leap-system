'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useEvents, useEventCategories } from '@/lib/hooks/use-api';
import { EventCard } from '@/components/cards/event-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoEvents } from '@/components/empty/no-events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, Plus, X, Filter } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { CreateEventModal } from '@/components/modals/create-event-modal';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { cn } from '@/lib/utils';

/**
 * Events Listing Page
 * 
 * RTL/LTR Support:
 * - All filters and content flow correctly in both directions
 * - Search bar uses logical positioning
 * - Text alignment respects reading direction
 * 
 * Theme Support:
 * - Cards and filters adapt to theme
 * - All text visible in both themes
 * - Proper contrast in dark/light modes
 */
export default function EventsPage() {
  const t = useTranslations('events.list');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch lookups for event types and categories
  const { data: eventTypes } = useLookupsByType(LookupTypeCode.EVENT_TYPE);
  const { data: eventCategories } = useEventCategories();

  // Fetch events with filters
  const { data: eventsData, isLoading } = useEvents({
    search: searchQuery || undefined,
    type: type !== 'all' ? type : undefined,
    category: category !== 'all' ? category : undefined,
  });

  const events = (eventsData ) || [];

  // Filter events client-side for additional filtering
  const filteredEvents = useMemo(() => {
    return events.filter((event: any) => {
      const matchesSearch = !searchQuery || 
        (event.titleEn || event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [events, searchQuery]);

  // Active filters count
  const activeFiltersCount = [type !== 'all', category !== 'all', searchQuery].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setType('all');
    setCategory('all');
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-start">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-start">
            {t('description')}
          </p>
        </div>
        <Button 
          className="gap-2 shrink-0" 
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('createEvent')}</span>
          <span className="sm:hidden">{t('createEvent')}</span>
        </Button>
      </div>

      {/* Banner Ad */}
      <AdContainer
        placement="events_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto hidden md:block"
      />

      {/* Filters Card */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 bg-background border-input"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-background border-input">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t('type.label')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="cursor-pointer">
                      {t('type.all')}
                    </SelectItem>
                    {eventTypes?.map((eventType) => (
                      <SelectItem 
                        key={eventType.code} 
                        value={eventType.code}
                        className="cursor-pointer"
                      >
                        {eventType.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                    <SelectValue placeholder={t('category.label')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="cursor-pointer">
                      {t('category.all')}
                    </SelectItem>
                    {eventCategories?.map((eventCategory) => (
                      <SelectItem 
                        key={eventCategory.id} 
                        value={String(eventCategory.id)}
                        className="cursor-pointer"
                      >
                        {eventCategory.nameEn || eventCategory.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeFiltersCount} {t('activeFilters', { count: activeFiltersCount })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="text-sm text-muted-foreground text-start">
          {t('showingResults', { count: filteredEvents.length })}
        </div>
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton variant="grid" count={6} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event: any, index: number) => (
            <div key={event.id || index}>
              <EventCard event={event} />
              {/* Insert ad after every 6 events */}
              {(index + 1) % 6 === 0 && (
                <AdContainer
                  key={`ad-${event.id}-${index}`}
                  placement="events_between_content"
                  type="sponsored"
                  className="mt-4 sm:mt-6"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <NoEvents />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
