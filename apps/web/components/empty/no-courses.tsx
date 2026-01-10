'use client';

import { EmptyState } from './empty-state';
import { BookOpen } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export function NoCourses() {
  const router = useRouter();

  return (
    <EmptyState
      icon={BookOpen}
      title="No courses found"
      description="Browse our catalog to find courses that interest you!"
      action={{
        label: 'Browse Courses',
        onClick: () => router.push('/hub/courses'),
      }}
    />
  );
}
