import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  InstructorDashboard,
  CourseStats,
  StudentProgress,
  CourseAnalytics,
  SessionWithDetails,
  CreateSessionDto,
  UpdateSessionDto,
  SessionFilters,
  AssignmentSubmission,
  QuizAttempt,
  GradeSubmissionDto,
} from '@leap-lms/shared-types';

// Instructor Dashboard
export function useInstructorDashboard() {
  return useQuery<InstructorDashboard>({
    queryKey: ['instructor', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/lms/instructor/dashboard');
      return response.data;
    },
  });
}

// Instructor Courses
export function useInstructorCourses() {
  return useQuery<CourseStats[]>({
    queryKey: ['instructor', 'courses'],
    queryFn: async () => {
      const response = await apiClient.get('/lms/instructor/courses');
      return response.data;
    },
  });
}

// Course Students
export function useCourseStudents(courseId: number) {
  return useQuery<StudentProgress[]>({
    queryKey: ['instructor', 'courses', courseId, 'students'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/instructor/courses/${courseId}/students`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Course Analytics
export function useCourseAnalytics(courseId: number) {
  return useQuery<CourseAnalytics>({
    queryKey: ['instructor', 'courses', courseId, 'analytics'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/instructor/courses/${courseId}/analytics`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Sessions
export function useInstructorSessions(filters?: SessionFilters) {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', filters],
    queryFn: async () => {
      const response = await apiClient.get('/lms/sessions', { params: filters });
      return response.data;
    },
  });
}

export function useUpcomingSessions() {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', 'upcoming'],
    queryFn: async () => {
      const response = await apiClient.get('/lms/instructor/sessions/upcoming');
      return response.data;
    },
  });
}

export function useCalendarSessions(startDate?: Date, endDate?: Date) {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', 'calendar', startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      const response = await apiClient.get('/lms/instructor/sessions/calendar', { params });
      return response.data;
    },
  });
}

export function useSession(sessionId: number) {
  return useQuery<SessionWithDetails>({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSessionDto) => {
      const response = await apiClient.post('/lms/sessions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSessionDto }) => {
      const response = await apiClient.patch(`/lms/sessions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/lms/sessions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
    },
  });
}

export function useSessionAttendees(sessionId: number) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'attendees'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/sessions/${sessionId}/attendees`);
      return response.data;
    },
    enabled: !!sessionId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: number; data: any }) => {
      const response = await apiClient.post(`/lms/sessions/${sessionId}/attendance`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
    },
  });
}

// Grading - Assignments
export function usePendingAssignments(courseId?: number) {
  return useQuery<AssignmentSubmission[]>({
    queryKey: ['instructor', 'assignments', 'pending', courseId],
    queryFn: async () => {
      const params: any = {};
      if (courseId) params.courseId = courseId;
      const response = await apiClient.get('/lms/assignments/submissions/pending', { params });
      return response.data;
    },
  });
}

export function useAssignmentSubmission(submissionId: number) {
  return useQuery<AssignmentSubmission>({
    queryKey: ['assignments', 'submissions', submissionId],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/assignments/submissions/${submissionId}`);
      return response.data;
    },
    enabled: !!submissionId,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GradeSubmissionDto }) => {
      const response = await apiClient.post(`/lms/assignments/submissions/${id}/grade`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments', 'submissions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'assignments', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
    },
  });
}

// Grading - Quizzes
export function useQuizAttempts(courseId?: number) {
  return useQuery<QuizAttempt[]>({
    queryKey: ['instructor', 'quizzes', 'attempts', courseId],
    queryFn: async () => {
      const params: any = {};
      if (courseId) params.courseId = courseId;
      const response = await apiClient.get('/lms/quizzes/attempts', { params });
      return response.data;
    },
  });
}

export function useQuizAttempt(attemptId: number) {
  return useQuery({
    queryKey: ['quizzes', 'attempts', attemptId],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/quizzes/attempts/${attemptId}`);
      return response.data;
    },
    enabled: !!attemptId,
  });
}

export function useReviewQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { feedback?: string; notes?: string } }) => {
      const response = await apiClient.post(`/lms/quizzes/attempts/${id}/review`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'attempts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'quizzes', 'attempts'] });
    },
  });
}

// Get quiz attempts for a specific quiz
export function useQuizAttemptsForQuiz(quizId: number) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'attempts'],
    queryFn: async () => {
      const response = await apiClient.get(`/lms/quizzes/${quizId}/attempts`);
      return response.data;
    },
    enabled: !!quizId,
  });
}
