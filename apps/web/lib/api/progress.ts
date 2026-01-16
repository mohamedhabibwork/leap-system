import { apiClient } from './client';

export interface CourseProgress {
  courseId: number;
  enrollmentId: number;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  timeSpentMinutes: number;
  lastAccessedAt: Date | null;
}

export interface LessonProgress {
  lessonId: number;
  enrollmentId: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
}

export interface TrackLessonProgressDto {
  timeSpent: number;
  completed: boolean;
  lastPosition?: number;
}

/**
 * Progress API Service
 */
export const progressAPI = {
  /**
   * Track lesson progress
   */
  trackLessonProgress: (lessonId: number, data: TrackLessonProgressDto) =>
    apiClient.post(`/lms/progress/lessons/${lessonId}`, data),

  /**
   * Get course progress
   */
  getCourseProgress: (courseId: number) =>
    apiClient.get<CourseProgress>(`/lms/progress/courses/${courseId}`),

  /**
   * Get lesson progress
   */
  getLessonProgress: (lessonId: number) =>
    apiClient.get<LessonProgress>(`/lms/progress/lessons/${lessonId}`),
};
