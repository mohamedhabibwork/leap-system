'use client';

import { ResourceCard } from './resource-card';
import { Card } from '@/components/ui/card';
import { FileX } from 'lucide-react';
import { CourseResource } from '@leap-lms/shared-types';

interface ResourceListProps {
  resources: CourseResource[];
  title?: string;
  emptyMessage?: string;
  locale?: string;
}

export function ResourceList({
  resources,
  title,
  emptyMessage = 'No resources available',
  locale = 'en',
}: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      <div className="space-y-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} locale={locale} />
        ))}
      </div>
    </div>
  );
}
