'use client';

import { EmptyState } from './empty-state';
import { FileText } from 'lucide-react';

export function NoPosts() {
  return (
    <EmptyState
      icon={FileText}
      title="No posts yet"
      description="Be the first to share something with your community!"
    />
  );
}
