import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';

interface InstructorStudentsParams {
  courseFilter?: string;
}

/**
 * Hook to fetch instructor's students
 */
export function useInstructorStudents(params: InstructorStudentsParams = {}) {
  const { user } = useAuthStore();
  const { courseFilter = '' } = params;

  const { data: students, isLoading } = useQuery({
    queryKey: ['instructor-students', user?.id, courseFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };
      const courseParam = courseFilter ? `?courseId=${courseFilter}` : '';
      return await apiClient.get(`/users/instructor/${user.id}/students${courseParam}`);
    },
    enabled: !!user?.id,
  });

  return {
    students: (students )?.data || [],
    total: (students )?.total || 0,
    isLoading,
  };
}
