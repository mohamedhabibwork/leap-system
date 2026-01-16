import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { coursesAPI } from '@/lib/api/courses';

/**
 * Hook to check if user has access to a course
 */
export function useCourseAccess(courseId: number) {
  const { canAccessCourse, hasActiveSubscription, user } = useAuthStore();

  const { data: accessStatus, isLoading } = useQuery({
    queryKey: ['course-access', courseId],
    queryFn: () => coursesAPI.getAccessStatus(courseId),
    enabled: !!courseId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check local store first (faster)
  const hasAccessLocal = canAccessCourse(courseId);

  return {
    hasAccess: accessStatus?.hasAccess ?? hasAccessLocal,
    isLoading,
    enrollment: accessStatus?.enrollment,
    hasSubscription: hasActiveSubscription(),
  };
}
