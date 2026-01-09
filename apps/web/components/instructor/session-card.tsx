'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, Edit, Trash2 } from 'lucide-react';
import type { SessionWithDetails } from '@leap-lms/shared-types';

interface SessionCardProps {
  session: SessionWithDetails;
  onEdit?: (session: SessionWithDetails) => void;
  onDelete?: (session: SessionWithDetails) => void;
  onView?: (session: SessionWithDetails) => void;
}

export function SessionCard({ session, onEdit, onDelete, onView }: SessionCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'default',
      in_progress: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{session.titleEn}</h3>
            {session.courseName && (
              <p className="text-sm text-muted-foreground">{session.courseName}</p>
            )}
          </div>
          {getStatusBadge(session.status)}
        </div>

        {/* Session Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(session.startTime), 'PPP')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(session.startTime), 'p')} - {format(new Date(session.endTime), 'p')}
            </span>
          </div>

          {session.attendanceCount !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {session.attendanceCount} 
                {session.maxAttendees ? ` / ${session.maxAttendees}` : ''} attendees
              </span>
            </div>
          )}

          {session.meetingUrl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4" />
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(session)} className="flex-1">
              View Details
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(session)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(session)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
