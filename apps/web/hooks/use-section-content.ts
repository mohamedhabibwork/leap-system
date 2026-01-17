import { useQueries } from '@tanstack/react-query';
import { assignmentsAPI } from '@/lib/api/assignments';
import apiClient from '@/lib/api/client';
import { useMemo } from 'react';

/**
 * Hook to fetch quizzes for multiple sections in parallel
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
      queryKey: ['quizzes', 'section', sectionId],
      queryFn: () => apiClient.get(`/lms/quizzes/section/${sectionId}`).then(res => (res as any).data || res).catch(() => []),
      enabled: typeof options?.enabled === 'function' 
        ? options.enabled(sectionId) 
        : (options?.enabled !== false && !!sectionId),
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // Default 5 minutes
      gcTime: options?.gcTime ?? 15 * 60 * 1000, // Default 15 minutes
    })),
  });

  // Create a map of sectionId -> quizzes for easier access
  const quizzesBySectionId = useMemo(() => {
    const map = new Map<number, any[]>();
    sectionIds.forEach((sectionId, index) => {
      const data = queries[index]?.data;
      if (data) {
        map.set(sectionId, Array.isArray(data) ? data : []);
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
      queryKey: ['assignments', 'section', sectionId],
      queryFn: () => assignmentsAPI.getBySection(sectionId).catch(() => []),
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
      const data = queries[index]?.data;
      if (data) {
        map.set(sectionId, Array.isArray(data) ? data : []);
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
