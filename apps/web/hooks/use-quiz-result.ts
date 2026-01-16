import { useQuery } from '@tanstack/react-query';
import { quizzesAPI } from '@/lib/api/quizzes';

/**
 * Hook to fetch quiz result
 */
export function useQuizResult(attemptId: number) {
  const { data: result, isLoading } = useQuery({
    queryKey: ['quiz-result', attemptId],
    queryFn: () => quizzesAPI.getResult(attemptId),
    enabled: !!attemptId,
  });

  return {
    result,
    isLoading,
  };
}
