'use client';

import { EmptyState } from './empty-state';
import { Bell } from 'lucide-react';

export function NoNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="You're all caught up!"
      description="No new notifications at this time."
    />
  );
}
