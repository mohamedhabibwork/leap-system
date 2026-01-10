import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { InstructorDashboard } from '@leap-lms/shared-types';

// Instructor Analytics
export function useInstructorAnalytics(dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['instructor', 'analytics', dateRange],
    queryFn: () => apiClient.get('/instructor/analytics', { params: dateRange }),
  });
}

export function useInstructorDashboardStats() {
  return useQuery({
    queryKey: ['instructor', 'dashboard', 'stats'],
    queryFn: () => apiClient.get('/instructor/dashboard/stats'),
  });
}

export function useInstructorDashboard() {
  return useQuery<InstructorDashboard>({
    queryKey: ['instructor', 'dashboard'],
    queryFn: () => apiClient.get<InstructorDashboard>('/lms/instructor/dashboard'),
  });
}

export function useCourseAnalytics(courseId: number) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'analytics'],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/analytics`),
    enabled: !!courseId,
  });
}

export function useStudentProgress(courseId: number) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'student-progress'],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/student-progress`),
    enabled: !!courseId,
  });
}

// Course Management
export function useInstructorCourses(params?: any) {
  return useQuery({
    queryKey: ['instructor', 'courses', params],
    queryFn: () => apiClient.get('/instructor/courses', { params }),
  });
}

export function useInstructorCourse(id: number) {
  return useQuery({
    queryKey: ['instructor', 'courses', id],
    queryFn: () => apiClient.get(`/instructor/courses/${id}`),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post('/instructor/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/instructor/courses/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) =>
      apiClient.post(`/instructor/courses/${courseId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
  });
}

export function useUnpublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) =>
      apiClient.post(`/instructor/courses/${courseId}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
  });
}

// Student Management
export function useInstructorStudents(params?: any) {
  return useQuery({
    queryKey: ['instructor', 'students', params],
    queryFn: () => apiClient.get('/instructor/students', { params }),
  });
}

export function useCourseStudents(courseId: number, params?: any) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'students', params],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/students`, { params }),
    enabled: !!courseId,
  });
}

export function useStudentDetail(studentId: number) {
  return useQuery({
    queryKey: ['instructor', 'students', studentId],
    queryFn: () => apiClient.get(`/instructor/students/${studentId}`),
    enabled: !!studentId,
  });
}

export function useSendMessageToStudent() {
  return useMutation({
    mutationFn: ({ studentId, message }: { studentId: number; message: string }) =>
      apiClient.post(`/instructor/students/${studentId}/message`, { message }),
  });
}

// Session Management
export function useSessions(params?: any) {
  return useQuery({
    queryKey: ['instructor', 'sessions', params],
    queryFn: () => apiClient.get('/instructor/sessions', { params }),
  });
}

export function useSession(id: number) {
  return useQuery({
    queryKey: ['instructor', 'sessions', id],
    queryFn: () => apiClient.get(`/instructor/sessions/${id}`),
    enabled: !!id,
  });
}

export function useScheduleSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post('/instructor/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/instructor/sessions/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiClient.post(`/instructor/sessions/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
    },
  });
}

// Assignment & Grading
export function useAssignments(courseId: number, params?: any) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'assignments', params],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/assignments`, { params }),
    enabled: !!courseId,
  });
}

export function useAssignment(id: number) {
  return useQuery({
    queryKey: ['instructor', 'assignments', id],
    queryFn: () => apiClient.get(`/instructor/assignments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: any }) =>
      apiClient.post(`/instructor/courses/${courseId}/assignments`, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/instructor/assignments/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments', id] });
    },
  });
}

export function useAssignmentSubmissions(assignmentId: number, params?: any) {
  return useQuery({
    queryKey: ['instructor', 'assignments', assignmentId, 'submissions', params],
    queryFn: () => apiClient.get(`/instructor/assignments/${assignmentId}/submissions`, { params }),
    enabled: !!assignmentId,
  });
}

export function useGradeAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, grade, feedback }: { submissionId: number; grade: number; feedback?: string }) =>
      apiClient.post(`/instructor/submissions/${submissionId}/grade`, { grade, feedback }),
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'submissions', submissionId] });
    },
  });
}

export function useBulkGrading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grades: Array<{ submissionId: number; grade: number; feedback?: string }>) =>
      apiClient.post('/instructor/submissions/bulk-grade', { grades }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'submissions'] });
    },
  });
}

// Quizzes
export function useQuizzes(courseId: number) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'quizzes'],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/quizzes`),
    enabled: !!courseId,
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', id],
    queryFn: () => apiClient.get(`/instructor/quizzes/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: any }) =>
      apiClient.post(`/instructor/courses/${courseId}/quizzes`, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.patch(`/instructor/quizzes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes', id] });
    },
  });
}

export function useQuizResults(quizId: number) {
  return useQuery({
    queryKey: ['instructor', 'quizzes', quizId, 'results'],
    queryFn: () => apiClient.get(`/instructor/quizzes/${quizId}/results`),
    enabled: !!quizId,
  });
}

// Announcements
export function useAnnouncements(courseId: number) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'announcements'],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/announcements`),
    enabled: !!courseId,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: any }) =>
      apiClient.post(`/instructor/courses/${courseId}/announcements`, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'announcements'] });
    },
  });
}

// Earnings & Revenue
export function useInstructorEarnings(params?: any) {
  return useQuery({
    queryKey: ['instructor', 'earnings', params],
    queryFn: () => apiClient.get('/instructor/earnings', { params }),
  });
}

export function useInstructorPayouts() {
  return useQuery({
    queryKey: ['instructor', 'payouts'],
    queryFn: () => apiClient.get('/instructor/payouts'),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      apiClient.post('/instructor/payouts/request', { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'payouts'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'earnings'] });
    },
  });
}

// Reviews & Ratings
export function useCourseReviews(courseId: number, params?: any) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'reviews', params],
    queryFn: () => apiClient.get(`/instructor/courses/${courseId}/reviews`, { params }),
    enabled: !!courseId,
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: number; reply: string }) =>
      apiClient.post(`/instructor/reviews/${reviewId}/reply`, { reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
  });
}
