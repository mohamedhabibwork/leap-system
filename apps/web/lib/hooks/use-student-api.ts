import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  StudentDashboard,
  StudentCourseProgress,
  PendingAssignment,
  PendingQuiz,
  CourseRecommendation,
  LearningStats,
  DetailedCourseProgress,
  Achievement,
} from '@leap-lms/shared-types';

// Student Dashboard
export function useStudentDashboard() {
  return useQuery<StudentDashboard>({
    queryKey: ['student', 'dashboard'],
    queryFn: () => apiClient.get<StudentDashboard>('/lms/student/dashboard'),
  });
}

// Student Courses
export function useStudentCourses() {
  return useQuery<StudentCourseProgress[]>({
    queryKey: ['student', 'courses'],
    queryFn: () => apiClient.get<StudentCourseProgress[]>('/lms/student/my-courses'),
  });
}

// Pending Assignments
export function usePendingAssignments() {
  return useQuery<PendingAssignment[]>({
    queryKey: ['student', 'assignments', 'pending'],
    queryFn: () => apiClient.get<PendingAssignment[]>('/lms/student/assignments/pending'),
  });
}

// Pending Quizzes
export function usePendingQuizzes() {
  return useQuery<PendingQuiz[]>({
    queryKey: ['student', 'quizzes', 'pending'],
    queryFn: () => apiClient.get<PendingQuiz[]>('/lms/student/quizzes/pending'),
  });
}

// Course Progress
export function useCourseProgress(courseId: number) {
  return useQuery<DetailedCourseProgress>({
    queryKey: ['student', 'progress', courseId],
    queryFn: () => apiClient.get<DetailedCourseProgress>(`/lms/student/progress/${courseId}`),
    enabled: !!courseId,
  });
}

// Course Recommendations
export function useCourseRecommendations() {
  return useQuery<CourseRecommendation[]>({
    queryKey: ['student', 'recommendations'],
    queryFn: () => apiClient.get<CourseRecommendation[]>('/lms/student/recommendations'),
  });
}

// Learning Stats
export function useLearningStats() {
  return useQuery<LearningStats>({
    queryKey: ['student', 'learning-stats'],
    queryFn: () => apiClient.get<LearningStats>('/lms/student/learning-stats'),
  });
}

// Achievements
export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ['student', 'achievements'],
    queryFn: () => apiClient.get<Achievement[]>('/lms/student/achievements'),
  });
}
