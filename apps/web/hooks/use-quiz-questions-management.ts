import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

/**
 * Hook to fetch quiz questions for management/editing
 */
export function useQuizQuestions(quizId: number, enabled = true) {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => apiClient.get(`/lms/quizzes/${quizId}/questions`),
    enabled: !!quizId && enabled,
  });
}

/**
 * Hook to fetch question bank
 */
export function useQuestionBank(enabled = true) {
  return useQuery({
    queryKey: ['question-bank'],
    queryFn: () => apiClient.get('/lms/question-bank'),
    enabled,
  });
}

/**
 * Hook to add questions to a quiz
 */
export function useAddQuestionsToQuiz(quizId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number[]>({
    mutationFn: (questionIds: number[]) =>
      apiClient.post(`/lms/quizzes/${quizId}/questions`, { questionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
  });
}

/**
 * Hook to remove a question from a quiz
 */
export function useRemoveQuestionFromQuiz(quizId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (questionId: number) =>
      apiClient.delete(`/lms/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
  });
}

/**
 * Hook to update question order in a quiz
 */
export function useUpdateQuizQuestionOrder(quizId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    Array<{ questionId: number; displayOrder: number }>
  >({
    mutationFn: (updates: Array<{ questionId: number; displayOrder: number }>) =>
      apiClient.patch(`/lms/quizzes/${quizId}/questions/order`, { updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
  });
}
