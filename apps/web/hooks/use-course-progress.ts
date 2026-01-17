import { useEffect } from 'react';
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

  // Sync with store - only update when progress changes
  useEffect(() => {
    if (progress?.progressPercentage !== undefined) {
      const currentProgress = courseProgress[courseId];
      // Only update if progress value has actually changed
      if (!currentProgress || currentProgress.progressPercentage !== progress.progressPercentage) {
        updateProgress(courseId, progress.progressPercentage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.progressPercentage, courseId, updateProgress]);

  const trackLessonProgressMutation = useMutation({
    mutationFn: ({
      lessonId,
      data,
    }: {
      lessonId: number;
      data: { timeSpent: number; completed: boolean; lastPosition?: number };
    }) => progressAPI.trackLessonProgress(lessonId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch course progress
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      // Invalidate lesson progress if completed
      if (variables.data.completed) {
        queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.lessonId] });
      }
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
    onSuccess: (_, lessonId) => {
      // Invalidate course progress
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      // Invalidate lesson progress to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
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
