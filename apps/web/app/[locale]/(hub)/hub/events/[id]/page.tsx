'use client';

import { useEvent, useEventRegistrations } from '@/lib/hooks/use-api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RegisterButton } from '@/components/buttons/register-button';
import { ShareButton } from '@/components/buttons/share-button';
import { SaveButton } from '@/components/buttons/save-button';
import { Calendar, MapPin, Users, Clock, DollarSign, Globe, Video, MapPinned } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

/**
 * Event Detail Page
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Icons use logical spacing (me/ms)
 * - Grid layout adapts to reading direction
 * - Flex items flow correctly in both directions
 * 
 * Theme Support:
 * - Uses theme-aware colors for all elements
 * - Card backgrounds adapt to theme
 * - Text colors use foreground variants
 * - Borders use theme-aware border colors
 */
export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);
  
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: registrations, isLoading: registrationsLoading } = useEventRegistrations(eventId, {
    limit: 10,
  });

  if (eventLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <MapPinned className="w-4 h-4" />;
      case 'hybrid':
        return <Globe className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'online':
        return 'bg-blue-500';
      case 'in-person':
        return 'bg-green-500';
      case 'hybrid':
        return 'bg-purple-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Cover Image */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-muted">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Calendar className="w-32 h-32 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-4 start-4 bg-card rounded-lg p-3 shadow-lg">
          <div className="text-xs font-semibold text-primary text-center">
            {format(eventDate, 'MMM').toUpperCase()}
          </div>
          <div className="text-3xl font-bold text-center">
            {format(eventDate, 'd')}
          </div>
        </div>

        {/* Featured Badge */}
        {event.isFeatured && (
          <Badge className="absolute top-4 end-4 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Actions */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold tracking-tight text-start flex-1">
                {event.title}
              </h1>
              <SaveButton
                entityType="event"
                entityId={event.id}
                isSaved={event.isFavorited}
                size="default"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getLocationTypeColor(event.locationType)}>
                {getLocationTypeIcon(event.locationType)}
                <span className="ms-1">{event.locationType}</span>
              </Badge>
              {event.category && (
                <Badge variant="outline">{event.category}</Badge>
              )}
            </div>

            {/* Organizer */}
            {event.organizer && (
              <Link 
                href={`/hub/users/${event.organizer.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.organizer.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {event.organizer.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-start">
                  <p className="text-sm text-muted-foreground">Organized by</p>
                  <p className="font-semibold">{event.organizer.name}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-start">About this event</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap text-start leading-relaxed">
                {event.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-start">Tags</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendees */}
          {registrations && registrations.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-start">
                  Attendees ({event.attendeeCount})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {registrations.map((registration: any) => (
                    <Link
                      key={registration.id}
                      href={`/hub/users/${registration.user.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={registration.user.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {registration.user.firstName?.[0]}
                          {registration.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-start">
                        <p className="font-medium truncate">
                          {registration.user.firstName} {registration.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {registration.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <RegisterButton
                eventId={event.id}
                registrationStatus={event.registrationStatus}
                size="lg"
              />
              
              <ShareButton
                entityType="event"
                entityId={event.id}
                url={`/hub/events/${event.id}`}
                title={event.title}
                shareCount={0}
              />
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-start">Event Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 text-start">
                  <p className="font-medium">
                    {format(eventDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(eventDate, 'h:mm a')}
                    {endDate && ` - ${format(endDate, 'h:mm a')}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 text-start">
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 text-start">
                  <p className="font-medium">Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {event.attendeeCount} going
                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  </p>
                </div>
              </div>

              {/* Price */}
              {event.price !== undefined && event.price > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 text-start">
                    <p className="font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      {event.currency} {event.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <Skeleton className="w-full h-[400px] rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}
