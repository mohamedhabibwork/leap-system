import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCourseStore } from '@/stores/course.store';
import { progressAPI } from '@/lib/api/progress';

/**
 * Hook to track course progress
 */
export function useCourseProgress(courseId: number) {
  const queryClient = useQueryClient();
  const { courseProgress, fetchProgress, updateProgress } = useCourseStore();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressAPI.getCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Sync with store
  if (progress) {
    updateProgress(courseId, progress.progressPercentage);
  }

  const trackLessonProgressMutation = useMutation({
    mutationFn: ({
      lessonId,
      data,
    }: {
      lessonId: number;
      data: { timeSpent: number; completed: boolean; lastPosition?: number };
    }) => progressAPI.trackLessonProgress(lessonId, data),
    onSuccess: () => {
      // Invalidate and refetch course progress
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      fetchProgress(courseId);
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: number) => {
      return trackLessonProgressMutation.mutateAsync({
        lessonId,
        data: {
          timeSpent: 0,
          completed: true,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      fetchProgress(courseId);
    },
  });

  return {
    progress: progress || courseProgress[courseId],
    isLoading,
    trackLessonProgress: trackLessonProgressMutation.mutate,
    completeLesson: completeLessonMutation.mutate,
    isTracking: trackLessonProgressMutation.isPending,
  };
}
