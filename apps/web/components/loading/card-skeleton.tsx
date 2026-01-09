'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  variant?: 'grid' | 'list';
  count?: number;
}

export function CardSkeleton({ variant = 'grid', count = 1 }: CardSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <Card key={index} className={variant === 'list' ? 'flex' : ''}>
          {/* Thumbnail/Image */}
          <Skeleton className={variant === 'grid' ? 'w-full h-48' : 'w-48 h-full'} />

          <div className="flex-1">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>

            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>

            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </div>
        </Card>
      ))}
    </>
  );
}
