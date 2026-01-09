'use client';

import { EmptyState } from './empty-state';
import { MessageCircle } from 'lucide-react';

export function NoMessages() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages yet"
      description="Start a conversation by messaging someone from your network!"
    />
  );
}
