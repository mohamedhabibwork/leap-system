import { useQueries } from '@tanstack/react-query';
import { lessonsAPI } from '@/lib/api/courses';
import { useMemo } from 'react';

/**
 * Hook to fetch quizzes for multiple sections in parallel
 * Extracts quizzes from lessons response (includes both section-level and lesson-level quizzes)
 * @param sectionIds Array of section IDs to fetch quizzes for
 * @param options Optional configuration for query behavior
 */
export function useSectionQuizzes(
  sectionIds: number[],
  options?: {
    enabled?: boolean | ((sectionId: number) => boolean);
    staleTime?: number;
    gcTime?: number;
  }
) {
  const queries = useQueries({
    queries: sectionIds.map((sectionId) => ({
      queryKey: ['lessons', 'section', sectionId],
      queryFn: () => lessonsAPI.getBySection(sectionId).catch(() => ({ lessons: [], assignments: [], quizzes: [] })),
      enabled: typeof options?.enabled === 'function' 
        ? options.enabled(sectionId) 
        : (options?.enabled !== false && !!sectionId),
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // Default 5 minutes
      gcTime: options?.gcTime ?? 15 * 60 * 1000, // Default 15 minutes
    })),
  });

  // Create a map of sectionId -> quizzes for easier access
  // Combines section-level quizzes and all lesson-level quizzes
  const quizzesBySectionId = useMemo(() => {
    const map = new Map<number, any[]>();
    sectionIds.forEach((sectionId, index) => {
      const response = queries[index]?.data;
      if (response) {
        const sectionQuizzes = response.quizzes || [];
        const lessonQuizzes = (response.lessons || []).flatMap((lesson: any) => lesson.quizzes || []);
        map.set(sectionId, [...sectionQuizzes, ...lessonQuizzes]);
      }
    });
    return map;
  }, [sectionIds, queries.map(q => q.data).join('|')]);

  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  return {
    queries,
    quizzesBySectionId,
    isLoading,
    isError,
  };
}

/**
 * Hook to fetch assignments for multiple sections in parallel
 * Extracts assignments from lessons response
 * @param sectionIds Array of section IDs to fetch assignments for
 * @param options Optional configuration for query behavior
 */
export function useSectionAssignments(
  sectionIds: number[],
  options?: {
    enabled?: boolean | ((sectionId: number) => boolean);
    staleTime?: number;
    gcTime?: number;
  }
) {
  const queries = useQueries({
    queries: sectionIds.map((sectionId) => ({
      queryKey: ['lessons', 'section', sectionId],
      queryFn: () => lessonsAPI.getBySection(sectionId).catch(() => ({ lessons: [], assignments: [], quizzes: [] })),
      enabled: typeof options?.enabled === 'function' 
        ? options.enabled(sectionId) 
        : (options?.enabled !== false && !!sectionId),
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // Default 5 minutes
      gcTime: options?.gcTime ?? 15 * 60 * 1000, // Default 15 minutes
    })),
  });

  // Create a map of sectionId -> assignments for easier access
  const assignmentsBySectionId = useMemo(() => {
    const map = new Map<number, any[]>();
    sectionIds.forEach((sectionId, index) => {
      const response = queries[index]?.data;
      if (response) {
        map.set(sectionId, response.assignments || []);
      }
    });
    return map;
  }, [sectionIds, queries.map(q => q.data).join('|')]);

  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  return {
    queries,
    assignmentsBySectionId,
    isLoading,
    isError,
  };
}
