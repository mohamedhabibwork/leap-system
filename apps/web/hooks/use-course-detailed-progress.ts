import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface DetailedProgress {
  completedQuizzes: number;
  averageQuizScore?: number;
  sectionProgress?: Record<number, { completedLessons: number; totalLessons: number }>;
}

/**
 * Hook to fetch detailed course progress including section breakdown
 */
export function useCourseDetailedProgress(courseId: number, enabled = true) {
  return useQuery<DetailedProgress>({
    queryKey: ['course-detailed-progress', courseId],
    queryFn: () => apiClient.get<DetailedProgress>(`/lms/progress/courses/${courseId}/detailed`),
    enabled: !!courseId && enabled,
  });
}
