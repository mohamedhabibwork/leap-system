import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

/**
 * Hook to fetch quiz attempt details for grading
 */
export function useQuizAttempt(attemptId: number, enabled = true) {
  return useQuery({
    queryKey: ['quiz-attempt', attemptId],
    queryFn: () => apiClient.get(`/instructor/quizzes/attempts/${attemptId}`),
    enabled: !!attemptId && enabled,
  });
}

/**
 * Hook to grade an essay question answer
 */
export function useGradeEssayAnswer(attemptId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      answerId: number;
      score: number;
      feedback?: string;
      maxPoints: number;
    }
  >({
    mutationFn: ({ answerId, score, feedback, maxPoints }) =>
      apiClient.post(`/lms/quizzes/answers/${answerId}/grade`, {
        score,
        feedback,
        maxPoints,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempt', attemptId] });
    },
  });
}
