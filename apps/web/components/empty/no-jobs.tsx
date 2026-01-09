'use client';

import { EmptyState } from './empty-state';
import { Briefcase } from 'lucide-react';

export function NoJobs() {
  return (
    <EmptyState
      icon={Briefcase}
      title="No jobs found"
      description="Try adjusting your filters or check back later for new opportunities!"
    />
  );
}
