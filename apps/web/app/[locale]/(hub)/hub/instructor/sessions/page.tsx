'use client';

import { useState } from 'react';
import { useInstructorSessions, useCalendarSessions } from '@/lib/hooks/use-instructor-api';
import { SessionCalendar } from '@/components/instructor/session-calendar';
import { SessionCard } from '@/components/instructor/session-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { Link } from '@/i18n/navigation';
import type { SessionWithDetails } from '@leap-lms/shared-types';

export default function InstructorSessionsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const { data: listSessions, isLoading: isLoadingList } = useInstructorSessions();
  const { data: calendarSessions, isLoading: isLoadingCalendar } = useCalendarSessions(
    dateRange.start,
    dateRange.end
  );

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleSelectSession = (session: SessionWithDetails) => {
    // TODO: Open session details modal or navigate to details page
    console.log('Selected session:', session);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your scheduled live sessions
          </p>
        </div>
        <Link href="/hub/instructor/sessions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {isLoadingList ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton count={6} />
            </div>
          ) : listSessions && listSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onView={handleSelectSession}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sessions scheduled</p>
              <Link href="/hub/instructor/sessions/new">
                <Button variant="link" className="mt-2">
                  Schedule your first session
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          {isLoadingCalendar ? (
            <CardSkeleton count={1} />
          ) : (
            <SessionCalendar
              sessions={calendarSessions || []}
              onSelectSession={handleSelectSession}
              onDateChange={handleDateChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
