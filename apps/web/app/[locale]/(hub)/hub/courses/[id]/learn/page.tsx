'use client';

import { use, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesAPI } from '@/lib/api/courses';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * Main learn page - redirects to first lesson route
 * The actual learning interface is in /learn/lessons/[lessonId]
 * Optimized with single endpoint that returns all course learning data
 */
export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses.learning');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  
  // Fetch complete learning data in a single optimized request
  const { data: learningData, isLoading } = useQuery({
    queryKey: ['course-learning-data', courseId],
    queryFn: () => coursesAPI.getLearningData(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const course = learningData?.course;
  const sections = learningData?.sections || [];

  // Get all lessons from all sections
  const allLessons = useMemo(() => {
    if (!sections) return [];
    return sections.flatMap((section: any) => 
      (section.lessons || []).map((lesson: any) => ({
        ...lesson,
        sectionId: section.id,
      }))
    );
  }, [sections]);

  // Redirect to first lesson route if no lesson is selected
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (!hasRedirected.current && allLessons.length > 0 && !isLoading) {
      hasRedirected.current = true;
      // Get first lesson with its sectionId
      const firstLesson = allLessons[0];
      
      // Redirect to first lesson route with sectionId
      router.push(`/hub/courses/${courseId}/sections/${firstLesson.sectionId}/lessons/${firstLesson.id}`);
    }
  }, [allLessons.length, isLoading, courseId, router]);

  if (isLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading course...' })} />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <p className="text-muted-foreground">{t('courseNotFound', { defaultValue: 'Course not found' })}</p>
        </Card>
      </div>
    );
  }

  // If no lessons, show message
  if (allLessons.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <p className="text-muted-foreground">{t('noContent', { defaultValue: 'No lessons available yet.' })}</p>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting
  return <PageLoader message={t('loading', { defaultValue: 'Loading lesson...' })} />;
}
