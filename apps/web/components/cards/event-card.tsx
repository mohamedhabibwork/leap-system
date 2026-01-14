'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { RegisterButton } from '@/components/buttons/register-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { ShareButton } from '@/components/buttons/share-button';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description?: string;
    image?: string;
    startDate: string;
    location?: string;
    type: 'online' | 'in-person' | 'hybrid';
    attendeeCount: number;
    registrationStatus?: 'going' | 'interested' | 'maybe' | 'not-going' | null;
    isFavorited?: boolean;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

/**
 * EventCard Component
 * Displays event information in grid or list format
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start/text-end
 * - Badge positioning uses logical properties
 * - Icons positioned with me/ms (margin-inline)
 * - Date badge uses start/end positioning
 * 
 * Theme Support:
 * - Card background adapts to theme
 * - Gradient fallback works in both themes
 * - Text colors use theme-aware classes
 * - Hover effects visible in both themes
 */
export function EventCard({ event, variant = 'grid', showActions = true }: EventCardProps) {
  const isGrid = variant === 'grid';
  const eventDate = new Date(event.startDate);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online':
        return 'bg-blue-500 text-white';
      case 'in-person':
        return 'bg-green-500 text-white';
      case 'hybrid':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={`card-interactive group ${isGrid ? '' : 'flex'}`}>
      <div className={`relative ${isGrid ? '' : 'flex-shrink-0'}`}>
        <Link href={`/hub/events/${event.id}`}>
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              width={isGrid ? 400 : 200}
              height={isGrid ? 200 : 150}
              className={`object-cover ${isGrid ? 'w-full h-48' : 'w-48 h-full'} ${isGrid ? 'rounded-t-xl' : 'rounded-s-xl'}`}
            />
          ) : (
            <div
              className={`bg-gradient-to-br from-section-events/20 to-section-events/5 ${
                isGrid ? 'h-48 rounded-t-xl' : 'w-48 rounded-s-xl'
              } flex items-center justify-center`}
            >
              <Calendar className="w-16 h-16 text-section-events" />
            </div>
          )}
        </Link>
        <div className="absolute top-3 start-3 bg-card/95 backdrop-blur-md rounded-xl p-2.5 text-center shadow-xl border border-border/50 min-w-[60px]">
          <div className="text-xs font-semibold text-section-events">
            {format(eventDate, 'MMM').toUpperCase()}
          </div>
          <div className="text-2xl font-bold text-foreground">{format(eventDate, 'd')}</div>
        </div>
        {event.registrationStatus === 'going' && (
          <div className="absolute top-3 end-3">
            <Badge className="bg-success text-success-foreground shadow-lg">
              Going
            </Badge>
          </div>
        )}
      </div>

      <div className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/hub/events/${event.id}`} className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary">
                {event.title}
              </h3>
            </Link>
            {showActions && (
              <FavoriteButton
                entityType="event"
                entityId={event.id}
                isFavorited={event.isFavorited}
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getTypeColor(event.type)}>
              {event.type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.attendeeCount} attending
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 text-start leading-relaxed">
              {event.description}
            </p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="text-start">{format(eventDate, 'EEEE, MMMM d, yyyy • h:mm a')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-start truncate">{event.location}</span>
              </div>
            )}
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="flex items-center justify-between gap-2">
            <RegisterButton
              eventId={event.id}
              registrationStatus={event.registrationStatus}
            />
            <ShareButton
              entityType="event"
              entityId={event.id}
              url={`/hub/events/${event.id}`}
              title={event.title}
            />
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
