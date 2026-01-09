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
    queryFn: () => apiClient.get<InstructorDashboard>('/lms/instructor/dashboard'),
  });
}

// Instructor Courses
export function useInstructorCourses() {
  return useQuery<CourseStats[]>({
    queryKey: ['instructor', 'courses'],
    queryFn: () => apiClient.get<CourseStats[]>('/lms/instructor/courses'),
  });
}

// Course Students
export function useCourseStudents(courseId: number) {
  return useQuery<StudentProgress[]>({
    queryKey: ['instructor', 'courses', courseId, 'students'],
    queryFn: () => apiClient.get<StudentProgress[]>(`/lms/instructor/courses/${courseId}/students`),
    enabled: !!courseId,
  });
}

// Course Analytics
export function useCourseAnalytics(courseId: number) {
  return useQuery<CourseAnalytics>({
    queryKey: ['instructor', 'courses', courseId, 'analytics'],
    queryFn: () => apiClient.get<CourseAnalytics>(`/lms/instructor/courses/${courseId}/analytics`),
    enabled: !!courseId,
  });
}

// Sessions
export function useInstructorSessions(filters?: SessionFilters) {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', filters],
    queryFn: () => apiClient.get<SessionWithDetails[]>('/lms/sessions', { params: filters }),
  });
}

export function useUpcomingSessions() {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', 'upcoming'],
    queryFn: () => apiClient.get<SessionWithDetails[]>('/lms/instructor/sessions/upcoming'),
  });
}

export function useCalendarSessions(startDate?: Date, endDate?: Date) {
  return useQuery<SessionWithDetails[]>({
    queryKey: ['instructor', 'sessions', 'calendar', startDate, endDate],
    queryFn: () => {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      return apiClient.get<SessionWithDetails[]>('/lms/instructor/sessions/calendar', { params });
    },
  });
}

export function useSession(sessionId: number) {
  return useQuery<SessionWithDetails>({
    queryKey: ['sessions', sessionId],
    queryFn: () => apiClient.get<SessionWithDetails>(`/lms/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionDto) => apiClient.post<any>('/lms/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSessionDto }) => 
      apiClient.patch<any>(`/lms/sessions/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<any>(`/lms/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
    },
  });
}

export function useSessionAttendees(sessionId: number) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'attendees'],
    queryFn: () => apiClient.get<any[]>(`/lms/sessions/${sessionId}/attendees`),
    enabled: !!sessionId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: any }) => 
      apiClient.post<any>(`/lms/sessions/${sessionId}/attendance`, data),
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
    queryFn: () => {
      const params: any = {};
      if (courseId) params.courseId = courseId;
      return apiClient.get<AssignmentSubmission[]>('/lms/assignments/submissions/pending', { params });
    },
  });
}

export function useAssignmentSubmission(submissionId: number) {
  return useQuery<AssignmentSubmission>({
    queryKey: ['assignments', 'submissions', submissionId],
    queryFn: () => apiClient.get<AssignmentSubmission>(`/lms/assignments/submissions/${submissionId}`),
    enabled: !!submissionId,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GradeSubmissionDto }) => 
      apiClient.post<any>(`/lms/assignments/submissions/${id}/grade`, data),
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
    queryFn: () => {
      const params: any = {};
      if (courseId) params.courseId = courseId;
      return apiClient.get<QuizAttempt[]>('/lms/quizzes/attempts', { params });
    },
  });
}

export function useQuizAttempt(attemptId: number) {
  return useQuery({
    queryKey: ['quizzes', 'attempts', attemptId],
    queryFn: () => apiClient.get<any>(`/lms/quizzes/attempts/${attemptId}`),
    enabled: !!attemptId,
  });
}

export function useReviewQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { feedback?: string; notes?: string } }) => 
      apiClient.post<any>(`/lms/quizzes/attempts/${id}/review`, data),
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
    queryFn: () => apiClient.get<any[]>(`/lms/quizzes/${quizId}/attempts`),
    enabled: !!quizId,
  });
}
