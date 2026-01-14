import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '@leap-lms/shared-types';

export function useQuestions(courseId?: number) {
  return useQuery<Question[]>({
    queryKey: ['question-bank', courseId ? { courseId } : 'all'],
    queryFn: () => {
      const params = courseId ? `?courseId=${courseId}` : '';
      return apiClient.get<Question[]>(`/lms/question-bank${params}`);
    },
  });
}

export function useGeneralQuestions() {
  return useQuery<Question[]>({
    queryKey: ['question-bank', 'general'],
    queryFn: () => apiClient.get<Question[]>('/lms/question-bank/general'),
  });
}

export function useCourseQuestions(courseId: number, enabled = true) {
  return useQuery<Question[]>({
    queryKey: ['question-bank', 'course', courseId],
    queryFn: () => apiClient.get<Question[]>(`/lms/question-bank/course/${courseId}`),
    enabled,
  });
}

export function useQuestion(id: number, enabled = true) {
  return useQuery<Question>({
    queryKey: ['question-bank', id],
    queryFn: () => apiClient.get<Question>(`/lms/question-bank/${id}`),
    enabled,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation<Question, Error, CreateQuestionRequest>({
    mutationFn: (data) => apiClient.post<Question>('/lms/question-bank', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      if (data.courseId) {
        queryClient.invalidateQueries({ queryKey: ['question-bank', 'course', data.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['question-bank', 'general'] });
      }
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation<Question, Error, { id: number; data: UpdateQuestionRequest }>({
    mutationFn: ({ id, data }) => apiClient.patch<Question>(`/lms/question-bank/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['question-bank', data.id] });
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      if (data.courseId) {
        queryClient.invalidateQueries({ queryKey: ['question-bank', 'course', data.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['question-bank', 'general'] });
      }
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id: number) => apiClient.delete(`/lms/question-bank/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
    },
  });
}
