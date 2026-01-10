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

export function EventCard({ event, variant = 'grid', showActions = true }: EventCardProps) {
  const isGrid = variant === 'grid';
  const eventDate = new Date(event.startDate);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online':
        return 'bg-blue-500';
      case 'in-person':
        return 'bg-green-500';
      case 'hybrid':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex'}`}>
      <div className={`relative ${isGrid ? '' : 'flex-shrink-0'}`}>
        <Link href={`/hub/events/${event.id}`}>
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              width={isGrid ? 400 : 200}
              height={isGrid ? 200 : 150}
              className={`object-cover ${isGrid ? 'w-full h-48' : 'w-48 h-full'} rounded-t-lg`}
            />
          ) : (
            <div
              className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 ${
                isGrid ? 'h-48' : 'w-48'
              } flex items-center justify-center`}
            >
              <Calendar className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </Link>
        <div className="absolute top-3 left-3 bg-card rounded-lg p-2 text-center shadow-lg">
          <div className="text-xs font-semibold text-red-500">
            {format(eventDate, 'MMM').toUpperCase()}
          </div>
          <div className="text-2xl font-bold">{format(eventDate, 'd')}</div>
        </div>
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
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>
          )}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(eventDate, 'EEEE, MMMM d, yyyy • h:mm a')}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.location}
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
