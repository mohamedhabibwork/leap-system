'use client';

import { use, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useCourse, useCourseLessons } from '@/lib/hooks/use-api';
import { sectionsAPI } from '@/lib/api/courses';
import { assignmentsAPI } from '@/lib/api/assignments';
import apiClient from '@/lib/api/client';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * Main learn page - redirects to first lesson route
 * The actual learning interface is in /learn/lessons/[lessonId]
 * Optimized with better caching and parallel queries
 */
export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('courses.learning');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  
  // Fetch course with optimized caching
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);

  // Fetch sections for the course with optimized caching
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => sectionsAPI.getByCourse(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch lessons for all sections with optimized caching
  const { data: allLessonsData, isLoading: isLoadingLessons } = useCourseLessons(courseId);

  // Get section IDs for parallel queries (only fetch when sections are loaded)
  const sectionIds = useMemo(() => sections?.map(s => s.id) || [], [sections]);
  
  // Fetch quizzes and assignments in parallel (only when sections are loaded)
  // These are less critical, so we can fetch them lazily
  useQueries({
    queries: sectionIds.map(sectionId => ({
      queryKey: ['quizzes', 'section', sectionId],
      queryFn: () => apiClient.get(`/lms/quizzes/section/${sectionId}`).then(res => (res as any).data || res).catch(() => []),
      enabled: !!sectionId && !!sections, // Only fetch when sections are loaded
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    })),
  });

  useQueries({
    queries: sectionIds.map(sectionId => ({
      queryKey: ['assignments', 'section', sectionId],
      queryFn: () => assignmentsAPI.getBySection(sectionId).catch(() => []),
      enabled: !!sectionId && !!sections, // Only fetch when sections are loaded
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    })),
  });

  // Get all lessons with their section info
  const allLessons = useMemo(() => {
    if (!sections || !allLessonsData) return [];
    return sections.flatMap((section: any) => 
      (allLessonsData.filter((l: any) => l.sectionId === section.id) || []).map((lesson: any) => ({
        ...lesson,
        sectionId: section.id,
      }))
    );
  }, [sections, allLessonsData]);

  // Redirect to first lesson route if no lesson is selected
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (!hasRedirected.current && allLessons.length > 0 && sections && !isLoadingSections && !isLoadingLessons) {
      hasRedirected.current = true;
      // Get first lesson with its sectionId
      const firstLesson = allLessons[0];
      
      // Redirect to first lesson route with sectionId
      router.push(`/hub/courses/${courseId}/sections/${firstLesson.sectionId}/lessons/${firstLesson.id}`);
    }
  }, [allLessons.length, sections, isLoadingSections, isLoadingLessons, courseId, router]);

  const isLoading = isLoadingCourse || isLoadingSections || isLoadingLessons;

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
