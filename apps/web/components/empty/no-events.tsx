'use client';

import { EmptyState } from './empty-state';
import { Calendar } from 'lucide-react';

export function NoEvents() {
  return (
    <EmptyState
      icon={Calendar}
      title="No upcoming events"
      description="Check back later for new events and activities!"
    />
  );
}
