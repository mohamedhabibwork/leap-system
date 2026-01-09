'use client';

import { CardSkeleton } from './card-skeleton';

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4">
      <CardSkeleton count={count} />
    </div>
  );
}
