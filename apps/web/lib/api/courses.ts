import { Assignment } from './assignments';
import { apiClient } from './client';
import { Quiz } from './quizzes';

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: number;
  instructor: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  categoryId?: number;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  currency: string;
  duration?: number; // in hours
  lessonCount?: number;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isEnrolled?: boolean;
  isFavorited?: boolean;
  progress?: number;
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CourseLesson {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number; // in minutes
  order: number;
  isPreview: boolean;
  isCompleted?: boolean;
  resources?: {
    id: number;
    title: string;
    type: 'pdf' | 'video' | 'link' | 'file';
    url: string;
  }[];
}

export interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  progressPercentage?: number;
  lastAccessedAt?: string;
  certificateUrl?: string;
  course?: Course;
}

export interface CourseReview {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateCourseDto {
  title: string;
  description: string;
  thumbnail?: string;
  categoryId?: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  currency: string;
  duration?: number;
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price?: number;
  duration?: number;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface EnrollCourseDto {
  paymentId?: string;
  couponCode?: string;
  enrollmentTypeId?: number;
  statusId?: number;
  enrollmentType?: 'purchase' | 'subscription' | 'free' | 'admin_granted';
}

export interface SubmitReviewDto {
  rating: number;
  comment?: string;
}

export interface CourseSection {
  id: number;
  courseId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LessonProgress {
  isCompleted: boolean;
  timeSpentMinutes: number;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface Lesson {
  id: number;
  sectionId: number;
  contentTypeId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  contentEn?: string;
  contentAr?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  durationMinutes?: number;
  displayOrder: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt?: string;
  canAccess?: boolean;
  accessReason?: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
  progress?: LessonProgress;
}

export interface CreateSectionDto {
  courseId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder?: number;
}

export interface UpdateSectionDto {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder?: number;
}

export interface CreateLessonDto {
  sectionId: number;
  contentTypeId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  contentEn?: string;
  contentAr?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  durationMinutes?: number;
  displayOrder?: number;
  isPreview?: boolean;
}

export interface UpdateLessonDto {
  contentTypeId?: number;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  contentEn?: string;
  contentAr?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  durationMinutes?: number;
  displayOrder?: number;
  isPreview?: boolean;
}

/**
 * Courses API Service
 * Handles all course-related API calls with authentication
 */
export const coursesAPI = {
  /**
   * Get all courses with pagination and filtering
   */
  getAll: (params?: any) => apiClient.get<Course[]>('/lms/courses', { params }),
  
  /**
   * Get a single course by ID
   */
  getById: (id: number) => apiClient.get<Course>(`/lms/courses/${id}`),
  
  /**
   * Create a new course
   */
  create: (data: CreateCourseDto) => apiClient.post<Course>('/lms/courses', data),
  
  /**
   * Update an existing course
   */
  update: (id: number, data: UpdateCourseDto) => apiClient.patch<Course>(`/lms/courses/${id}`, data),
  
  /**
   * Delete a course
   */
  delete: (id: number) => apiClient.delete(`/lms/courses/${id}`),
  
  /**
   * Enroll in a course
   */
  enroll: (id: number, data?: EnrollCourseDto) => apiClient.post<Enrollment>(`/lms/courses/${id}/enroll`, data),
  
  /**
   * Unenroll from a course
   */
  unenroll: (id: number) => apiClient.delete(`/lms/courses/${id}/enroll`),
  
  /**
   * Get course lessons
   */
  getLessons: (id: number, params?: any) => apiClient.get<CourseLesson[]>(`/lms/courses/${id}/lessons`, { params }),
  
  /**
   * Get a single lesson
   */
  getLesson: (courseId: number, lessonId: number) => apiClient.get<CourseLesson>(`/lms/courses/${courseId}/lessons/${lessonId}`),
  
  /**
   * Mark lesson as complete
   */
  markLessonComplete: (courseId: number, lessonId: number) => apiClient.post(`/lms/courses/${courseId}/lessons/${lessonId}/complete`),
  
  /**
   * Get course progress
   */
  getProgress: (id: number) => apiClient.get<{ progress: number; completedLessons: number; totalLessons: number }>(`/lms/courses/${id}/progress`),
  
  /**
   * Get complete learning data for a course (course, sections, lessons with quizzes/assignments, and progress)
   */
  getLearningData: (id: number) => apiClient.get<{
    course: Course;
    sections: Array<CourseSection & {
      lessons: Array<Lesson & { 
        quizzes?: Quiz[]; 
        assignments?: Assignment[];
        progress: LessonProgress; // Progress is always included (defaults to empty if no progress exists)
      }>;
      assignments: Assignment[];
      quizzes: Quiz[];
    }>;
    progress: {
      courseId: number;
      enrollmentId: number;
      progressPercentage: number;
      completedLessons: number;
      totalLessons: number;
      timeSpentMinutes: number;
      lastAccessedAt: string | null;
    } | null;
  }>(`/lms/courses/${id}/learning-data`),
  
  /**
   * Get course access status for current user
   */
  getAccessStatus: (id: number) => apiClient.get<{ hasAccess: boolean; enrollment?: any }>(`/lms/courses/${id}/access-status`),
  
  /**
   * Get my enrolled courses
   */
  getMyEnrollments: (params?: any) => apiClient.get<Enrollment[]>('/lms/courses/my-enrollments', { params }),
  
  /**
   * Get my created courses (as instructor)
   */
  getMyCourses: (params?: any) => apiClient.get<Course[]>('/lms/courses/my-courses', { params }),
  
  /**
   * Get course reviews
   */
  getReviews: (id: number, params?: any) => apiClient.get<CourseReview[]>(`/lms/courses/${id}/reviews`, { params }),
  
  /**
   * Submit a course review
   */
  submitReview: (id: number, data: SubmitReviewDto) => apiClient.post<CourseReview>(`/lms/courses/${id}/reviews`, data),
  
  /**
   * Update a course review
   */
  updateReview: (courseId: number, reviewId: number, data: SubmitReviewDto) => apiClient.patch<CourseReview>(`/lms/courses/${courseId}/reviews/${reviewId}`, data),
  
  /**
   * Delete a course review
   */
  deleteReview: (courseId: number, reviewId: number) => apiClient.delete(`/lms/courses/${courseId}/reviews/${reviewId}`),
  
  /**
   * Feature a course
   */
  feature: (id: number) => apiClient.post(`/lms/courses/${id}/feature`),
  
  /**
   * Unfeature a course
   */
  unfeature: (id: number) => apiClient.delete(`/lms/courses/${id}/feature`),
  
  /**
   * Get course statistics
   */
  getStatistics: () => apiClient.get('/lms/courses/statistics'),
  
  /**
   * Export courses to CSV
   */
  exportToCsv: (params?: any) => apiClient.get('/lms/courses/export/csv', { params, responseType: 'blob' }),
};

/**
 * Sections API Service
 */
export const sectionsAPI = {
  /**
   * Create a new section
   */
  create: (data: CreateSectionDto) => apiClient.post<CourseSection>('/lms/sections', data),
  
  /**
   * Get all sections for a course
   */
  getByCourse: (courseId: number) => apiClient.get<CourseSection[]>(`/lms/sections/course/${courseId}`),
  
  /**
   * Get a section by ID
   */
  getById: (id: number) => apiClient.get<CourseSection>(`/lms/sections/${id}`),
  
  /**
   * Update a section
   */
  update: (id: number, data: UpdateSectionDto) => apiClient.patch<CourseSection>(`/lms/sections/${id}`, data),
  
  /**
   * Delete a section
   */
  delete: (id: number) => apiClient.delete(`/lms/sections/${id}`),
};

/**
 * Response type for getBySection - includes lessons with their quizzes, plus section-level assignments and quizzes
 */
export interface SectionLessonsResponse {
  lessons: Array<Lesson & { quizzes?: any[] }>;
  assignments: any[];
  quizzes: any[];
}

/**
 * Lessons API Service
 */
export const lessonsAPI = {
  /**
   * Create a new lesson
   */
  create: (data: CreateLessonDto) => apiClient.post<Lesson>('/lms/lessons', data),
  
  /**
   * Get all lessons for a section (includes assignments and quizzes)
   */
  getBySection: (sectionId: number) => apiClient.get<SectionLessonsResponse>(`/lms/lessons/section/${sectionId}`),
  
  /**
   * Get a lesson by ID
   */
  getById: (id: number) => apiClient.get<Lesson>(`/lms/lessons/${id}`),
  
  /**
   * Update a lesson
   */
  update: (id: number, data: UpdateLessonDto) => apiClient.patch<Lesson>(`/lms/lessons/${id}`, data),
  
  /**
   * Delete a lesson
   */
  delete: (id: number) => apiClient.delete(`/lms/lessons/${id}`),
};

export default coursesAPI;
