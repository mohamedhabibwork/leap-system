import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

/**
 * Hook to manage admin courses
 */
export function useAdminCourses() {
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => apiClient.get('/lms/courses?page=1&limit=100'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/lms/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });

  return {
    courses: (courses as any) || [],
    isLoading,
    deleteCourse: (id: number) => deleteMutation.mutate(id),
    isDeleting: deleteMutation.isPending,
  };
}
