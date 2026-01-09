'use client';

import { useState } from 'react';
import { useEnrollments } from '@/lib/hooks/use-api';
import { CourseCard } from '@/components/cards/course-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyCoursesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('in-progress');
  const { data: enrollments, isLoading } = useEnrollments();

  const filteredEnrollments = (enrollments as any)?.filter((enrollment: any) => {
    if (filter === 'in-progress') return enrollment.progress < 100;
    if (filter === 'completed') return enrollment.progress === 100;
    if (filter === 'not-started') return enrollment.progress === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-2">
          Continue learning where you left off
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton count={6} />
            </div>
          ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrollments.map((enrollment: any) => (
                <CourseCard
                  key={enrollment.id}
                  course={{
                    ...enrollment.course,
                    progress: enrollment.progress,
                    isEnrolled: true,
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="You haven't enrolled in any courses yet. Start learning today!"
              action={{
                label: 'Browse Courses',
                onClick: () => router.push('/hub/courses'),
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
