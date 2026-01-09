'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { SessionWithDetails } from '@leap-lms/shared-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface SessionCalendarProps {
  sessions: SessionWithDetails[];
  onSelectSession?: (session: SessionWithDetails) => void;
  onDateChange?: (start: Date, end: Date) => void;
  className?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: SessionWithDetails;
}

export function SessionCalendar({
  sessions,
  onSelectSession,
  onDateChange,
  className,
}: SessionCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Convert sessions to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return sessions.map((session) => ({
      id: session.id,
      title: `${session.titleEn} - ${session.courseName || 'Course'}`,
      start: new Date(session.startTime),
      end: new Date(session.endTime),
      resource: session,
    }));
  }, [sessions]);

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (onSelectSession) {
        onSelectSession(event.resource);
      }
    },
    [onSelectSession]
  );

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Handle date navigation
  const handleNavigate = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      
      if (onDateChange) {
        let start: Date;
        let end: Date;

        if (view === 'month') {
          start = startOfMonth(newDate);
          end = endOfMonth(newDate);
        } else if (view === 'week') {
          start = startOfWeek(newDate);
          end = new Date(start);
          end.setDate(end.getDate() + 6);
        } else {
          start = new Date(newDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(newDate);
          end.setHours(23, 59, 59, 999);
        }

        onDateChange(start, end);
      }
    },
    [view, onDateChange]
  );

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const session = event.resource;
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    let backgroundColor = '#3b82f6'; // blue
    
    if (session.status === 'completed') {
      backgroundColor = '#10b981'; // green
    } else if (session.status === 'cancelled') {
      backgroundColor = '#ef4444'; // red
    } else if (start <= now && end >= now) {
      backgroundColor = '#f59e0b'; // orange (in progress)
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  }, []);

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-lg font-semibold">
          {toolbar.label}
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('p-6', className)}>
      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          popup
          showMultiDayTimes
          step={30}
          timeslots={2}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span>Cancelled</span>
        </div>
      </div>
    </Card>
  );
}
