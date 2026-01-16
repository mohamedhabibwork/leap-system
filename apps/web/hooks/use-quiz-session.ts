import { useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useQuizStore } from '@/stores/quiz.store';
import { quizzesAPI, type Quiz, type QuizAttempt } from '@/lib/api/quizzes';
import apiClient from '@/lib/api/client';

/**
 * Hook to manage quiz session
 */
export function useQuizSession(quizId: number) {
  const {
    activeQuiz,
    timeRemaining,
    timerActive,
    startQuiz,
    answerQuestion,
    submitQuiz: submitQuizStore,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    flagQuestion,
    pauseTimer,
    resumeTimer,
    updateTimeRemaining,
    clearActiveQuiz,
  } = useQuizStore();

  // Fetch quiz data to get time limit
  const { data: quizData } = useQuery<Quiz>({
    queryKey: ['quiz', quizId],
    queryFn: () => apiClient.get<Quiz>(`/lms/quizzes/${quizId}`),
    enabled: !!quizId,
  });

  // Start quiz attempt
  const startMutation = useMutation({
    mutationFn: () => quizzesAPI.startAttempt(quizId),
    onSuccess: async (attempt: QuizAttempt) => {
      // Get questions
      const questionsData = await quizzesAPI.getQuestions(quizId);
      
      // Calculate time limit from quiz data (convert minutes to seconds)
      const timeLimit = quizData?.timeLimitMinutes
        ? quizData.timeLimitMinutes * 60
        : undefined;
      
      startQuiz(quizId, questionsData.questions, attempt.id, timeLimit);
    },
  });

  // Get time remaining
  const { data: timeData } = useQuery({
    queryKey: ['quiz-time', activeQuiz?.attemptId],
    queryFn: () =>
      activeQuiz
        ? quizzesAPI.getTimeRemaining(activeQuiz.attemptId)
        : Promise.resolve({ timeRemaining: null }),
    enabled: !!activeQuiz && timerActive,
    refetchInterval: 1000, // Update every second
  });

  // Update time remaining from API
  useEffect(() => {
    if (timeData?.timeRemaining !== undefined && timeData.timeRemaining !== null) {
      updateTimeRemaining(timeData.timeRemaining);
    }
  }, [timeData, updateTimeRemaining]);

  // Submit quiz
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeQuiz) throw new Error('No active quiz');
      
      const answers = Array.from(activeQuiz.answers.values());
      return quizzesAPI.submitQuiz(activeQuiz.attemptId, { answers });
    },
    onSuccess: (result) => {
      clearActiveQuiz();
      return result;
    },
  });

  const handleSubmit = useCallback(async () => {
    try {
      const result = await submitMutation.mutateAsync();
      return result;
    } catch (error) {
      throw error;
    }
  }, [submitMutation]);

  // Pause/resume
  const pauseMutation = useMutation({
    mutationFn: () =>
      activeQuiz ? quizzesAPI.pauseAttempt(activeQuiz.attemptId) : Promise.resolve(),
    onSuccess: () => pauseTimer(),
  });

  const resumeMutation = useMutation({
    mutationFn: () =>
      activeQuiz ? quizzesAPI.resumeAttempt(activeQuiz.attemptId) : Promise.resolve(),
    onSuccess: () => resumeTimer(),
  });

  // Flag question
  const flagMutation = useMutation({
    mutationFn: async (questionId: number) =>
      activeQuiz
        ? await quizzesAPI.flagQuestion(activeQuiz.attemptId, questionId)
        : Promise.resolve(),
  });

  return {
    activeQuiz,
    timeRemaining,
    timerActive,
    currentQuestion:
      activeQuiz?.questions[activeQuiz.currentQuestionIndex] || null,
    currentQuestionIndex: activeQuiz?.currentQuestionIndex || 0,
    totalQuestions: activeQuiz?.questions.length || 0,
    startQuiz: () => startMutation.mutate(),
    answerQuestion,
    submitQuiz: handleSubmit,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    flagQuestion: (questionId: number) => flagMutation.mutate(questionId),
    pauseTimer: () => pauseMutation.mutate(),
    resumeTimer: () => resumeMutation.mutate(),
    isLoading: startMutation.isPending || submitMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
}
