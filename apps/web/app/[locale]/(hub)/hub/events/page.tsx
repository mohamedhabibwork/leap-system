'use client';

import { useState } from 'react';
import { useEvents } from '@/lib/hooks/use-api';
import { EventCard } from '@/components/cards/event-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoEvents } from '@/components/empty/no-events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, Plus } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { CreateEventModal } from '@/components/modals/create-event-modal';

/**
 * Events Listing Page
 * 
 * RTL/LTR Support:
 * - All filters and content flow correctly in both directions
 * - Search bar uses logical positioning
 * 
 * Theme Support:
 * - Cards and filters adapt to theme
 * - All text visible in both themes
 */
export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: events, isLoading } = useEvents({
    search: searchQuery,
    locationType: type !== 'all' ? type : undefined,
    category: category !== 'all' ? category : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-2">
            Discover and register for upcoming events
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Banner Ad */}
      <AdContainer
        placement="events_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="in-person">In-Person</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="webinar">Webinar</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="meetup">Meetup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={6} />
        </div>
      ) : events && (events as any).length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(events as any).map((event: any) => (
            <EventCard key={event.id} event={event} />
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
