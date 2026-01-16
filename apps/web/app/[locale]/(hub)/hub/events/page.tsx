'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEvents } from '@/lib/hooks/use-api';
import { EventCard } from '@/components/cards/event-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoEvents } from '@/components/empty/no-events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const t = useTranslations('events.list');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ...

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-start">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-start">
            {t('description')}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          {t('createEvent')}
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

      {/* Filters Card */}
      <Card className="card-feature">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Calendar className="h-4 w-4 me-2" />
                <SelectValue placeholder={t('type.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('type.all')}</SelectItem>
                <SelectItem value="online">{t('type.online')}</SelectItem>
                <SelectItem value="in-person">{t('type.inPerson')}</SelectItem>
                <SelectItem value="hybrid">{t('type.hybrid')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('category.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('category.all')}</SelectItem>
                <SelectItem value="workshop">{t('category.workshop')}</SelectItem>
                <SelectItem value="webinar">{t('category.webinar')}</SelectItem>
                <SelectItem value="conference">{t('category.conference')}</SelectItem>
                <SelectItem value="meetup">{t('category.meetup')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ... rest of page */}
    </div>
  );
}
