'use client';

import { useState } from 'react';
import { useEnrollments } from '@/lib/hooks/use-api';
import { CourseCard } from '@/components/cards/course-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { EmptyState } from '@/components/empty/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, Play } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function MyCoursesPage() {
  const router = useRouter();
  const t = useTranslations('courses.myCourses');
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
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">{t('filters.all')}</TabsTrigger>
          <TabsTrigger value="in-progress">{t('filters.inProgress')}</TabsTrigger>
          <TabsTrigger value="completed">{t('filters.completed')}</TabsTrigger>
          <TabsTrigger value="not-started">{t('filters.notStarted')}</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton count={6} />
            </div>
          ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrollments.map((enrollment: any) => {
                const hasCertificate = enrollment.progress === 100;
                return (
                  <div key={enrollment.id} className="relative">
                    <CourseCard
                      course={{
                        ...enrollment.course,
                        progress: enrollment.progress,
                        isEnrolled: true,
                      }}
                    />
                    {hasCertificate && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="default" className="bg-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          {t('certificate')}
                        </Badge>
                      </div>
                    )}
                    {enrollment.progress > 0 && enrollment.progress < 100 && (
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{t('progress')}</span>
                          <span className="font-medium">{enrollment.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => router.push(`/hub/courses/${enrollment.course.id}/learn`)}
                        >
                          <Play className="h-3 w-3 mr-2" />
                          {t('continueLearning')}
                        </Button>
                      </div>
                    )}
                    {hasCertificate && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => router.push(`/hub/courses/${enrollment.course.id}/certificate`)}
                      >
                        <Award className="h-3 w-3 mr-2" />
                        {t('viewCertificate')}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title={t('emptyState.title')}
              description={t('emptyState.description')}
              action={{
                label: t('emptyState.browseCourses'),
                onClick: () => router.push('/hub/courses'),
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
