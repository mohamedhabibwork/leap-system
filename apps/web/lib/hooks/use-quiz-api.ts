import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  Quiz,
  StartQuizResponse,
  QuizQuestionsForTaking,
  SubmitQuizRequest,
  SubmitQuizResponse,
  QuizAttemptResult,
  QuizAttempt,
} from '@leap-lms/shared-types';

// Student Quiz Hooks

export function useStartQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<StartQuizResponse, Error, number>({
    mutationFn: (quizId: number) => apiClient.post<StartQuizResponse>(`/lms/quizzes/${quizId}/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'my-attempts'] });
    },
  });
}

export function useQuizQuestions(quizId: number, enabled = true) {
  return useQuery<QuizQuestionsForTaking>({
    queryKey: ['quizzes', quizId, 'questions'],
    queryFn: () => apiClient.get<QuizQuestionsForTaking>(`/lms/quizzes/${quizId}/questions`),
    enabled,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<SubmitQuizResponse, Error, SubmitQuizRequest>({
    mutationFn: (data: SubmitQuizRequest) => 
      apiClient.post<SubmitQuizResponse>(`/lms/quizzes/attempts/${data.attemptId}/submit`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'attempts', variables.attemptId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'my-attempts'] });
    },
  });
}

export function useQuizResult(attemptId: number, enabled = true) {
  return useQuery<QuizAttemptResult>({
    queryKey: ['quizzes', 'attempts', attemptId, 'result'],
    queryFn: () => apiClient.get<QuizAttemptResult>(`/lms/quizzes/attempts/${attemptId}/result`),
    enabled,
  });
}

export function useMyQuizAttempts() {
  return useQuery<QuizAttempt[]>({
    queryKey: ['quizzes', 'my-attempts'],
    queryFn: () => apiClient.get<QuizAttempt[]>('/lms/quizzes/my-attempts'),
  });
}

// Instructor Quiz Management Hooks

export function useQuiz(quizId: number, enabled = true) {
  return useQuery<Quiz>({
    queryKey: ['quizzes', quizId],
    queryFn: () => apiClient.get<Quiz>(`/lms/quizzes/${quizId}`),
    enabled,
  });
}

export function useSectionQuizzes(sectionId: number, enabled = true) {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes', 'section', sectionId],
    queryFn: () => apiClient.get<Quiz[]>(`/lms/quizzes/section/${sectionId}`),
    enabled,
  });
}

export function useLessonQuizzes(lessonId: number, enabled = true) {
  return useQuery<Quiz[]>({
    queryKey: ['quizzes', 'lesson', lessonId],
    queryFn: () => apiClient.get<Quiz[]>(`/lms/quizzes/lesson/${lessonId}`),
    enabled,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<Quiz, Error, any>({
    mutationFn: (data) => apiClient.post<Quiz>('/lms/quizzes', data),
    onSuccess: (data) => {
      if (data.sectionId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'section', data.sectionId] });
      }
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'lesson', data.lessonId] });
      }
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<Quiz, Error, { id: number; data: any }>({
    mutationFn: ({ id, data }) => apiClient.patch<Quiz>(`/lms/quizzes/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', data.id] });
      if (data.sectionId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'section', data.sectionId] });
      }
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['quizzes', 'lesson', data.lessonId] });
      }
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id: number) => apiClient.delete(`/lms/quizzes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useAddQuestionsToQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { quizId: number; questionIds: number[] }>({
    mutationFn: ({ quizId, questionIds }) => 
      apiClient.post(`/lms/quizzes/${quizId}/questions`, { questionIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId, 'questions'] });
    },
  });
}

export function useRemoveQuestionFromQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { quizId: number; questionId: number }>({
    mutationFn: ({ quizId, questionId }) => 
      apiClient.delete(`/lms/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId, 'questions'] });
    },
  });
}

export function useQuizQuestionsForManagement(quizId: number, enabled = true) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'questions', 'management'],
    queryFn: () => apiClient.get(`/lms/quizzes/${quizId}/questions`),
    enabled,
  });
}
