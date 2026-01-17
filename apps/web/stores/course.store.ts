import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { coursesAPI } from '@/lib/api/courses';

export interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
  enrollmentType: 'purchase' | 'subscription' | 'free' | 'admin_granted';
  progressPercentage: number;
  enrolledAt: Date;
  expiresAt?: Date | null;
  completedAt?: Date | null;
}

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

interface CourseState {
  // Enrollment
  enrolledCourses: Record<number, Enrollment>;
  
  // Progress
  courseProgress: Record<number, CourseProgress>;
  lessonProgress: Record<number, LessonProgress>;
  
  // Current Learning Session
  activeCourse: number | null;
  activeLesson: number | null;
  activeSection: number | null;
  
  // Filters & UI
  filters: {
    category: string | null;
    level: string | null;
    price: 'free' | 'paid' | 'all';
    language: string | null;
  };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveCourse: (courseId: number) => void;
  setActiveLesson: (lessonId: number) => void;
  setActiveSection: (sectionId: number) => void;
  updateProgress: (courseId: number, progress: number) => void;
  markLessonComplete: (lessonId: number) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  setFilters: (filters: Partial<CourseState['filters']>) => void;
  clearFilters: () => void;
  
  // API Actions
  enrollInCourse: (courseId: number, type: 'purchase' | 'subscription') => Promise<void>;
  fetchProgress: (courseId: number) => Promise<void>;
  completeLesson: (courseId: number, lessonId: number) => Promise<void>;
  fetchEnrollments: () => Promise<void>;
}

const DEFAULT_FILTERS = {
  category: null,
  level: null,
  price: 'all' as const,
  language: null,
};

export const useCourseStore = create<CourseState>()(
  devtools(
    persist(
      (set, get) => ({
        enrolledCourses: {},
        courseProgress: {},
        lessonProgress: {},
        activeCourse: null,
        activeLesson: null,
        activeSection: null,
        filters: DEFAULT_FILTERS,
        isLoading: false,
        error: null,

        setActiveCourse: (courseId) => set({ activeCourse: courseId }),
        setActiveLesson: (lessonId) => set({ activeLesson: lessonId }),
        setActiveSection: (sectionId) => set({ activeSection: sectionId }),
        
        updateProgress: (courseId, progress) => {
          const currentProgress = get().courseProgress[courseId];
          // Only update if progress value has actually changed
          if (currentProgress && currentProgress.progressPercentage === progress) {
            return; // No change needed
          }
          if (currentProgress) {
            set({
              courseProgress: {
                ...get().courseProgress,
                [courseId]: {
                  ...currentProgress,
                  progressPercentage: progress,
                },
              },
            });
          }
        },
        
        markLessonComplete: (lessonId) => {
          const currentProgress = get().lessonProgress[lessonId];
          if (currentProgress) {
            set({
              lessonProgress: {
                ...get().lessonProgress,
                [lessonId]: {
                  ...currentProgress,
                  isCompleted: true,
                  completedAt: new Date(),
                },
              },
            });
          }
        },
        
        addEnrollment: (enrollment) => {
          set({
            enrolledCourses: {
              ...get().enrolledCourses,
              [enrollment.courseId]: enrollment,
            },
          });
        },
        
        setFilters: (filters) => {
          set({
            filters: {
              ...get().filters,
              ...filters,
            },
          });
        },
        
        clearFilters: () => {
          set({ filters: DEFAULT_FILTERS });
        },
        
        enrollInCourse: async (courseId, type) => {
          set({ isLoading: true, error: null });
          try {
            const enrollment = await coursesAPI.enroll(courseId, {
              enrollmentType: type,
            });
            get().addEnrollment(enrollment);
          } catch (error: any) {
            set({ error: error.message || 'Failed to enroll in course' });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },
        
        fetchProgress: async (courseId) => {
          set({ isLoading: true, error: null });
          try {
            const progress = await coursesAPI.getProgress(courseId);
            set({
              courseProgress: {
                ...get().courseProgress,
                [courseId]: progress,
              },
            });
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch progress' });
          } finally {
            set({ isLoading: false });
          }
        },
        
        completeLesson: async (courseId, lessonId) => {
          set({ isLoading: true, error: null });
          try {
            await coursesAPI.markLessonComplete(courseId, lessonId);
            get().markLessonComplete(lessonId);
            // Refresh course progress
            await get().fetchProgress(courseId);
          } catch (error: any) {
            set({ error: error.message || 'Failed to complete lesson' });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },
        
        fetchEnrollments: async () => {
          set({ isLoading: true, error: null });
          try {
            const enrollments = await coursesAPI.getMyEnrollments();
            const enrolledCoursesMap: Record<number, Enrollment> = {};
            enrollments.forEach((enrollment: any) => {
              enrolledCoursesMap[enrollment.courseId] = enrollment;
            });
            set({ enrolledCourses: enrolledCoursesMap });
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch enrollments' });
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'course-storage',
        partialize: (state) => ({
          enrolledCourses: state.enrolledCourses,
          courseProgress: state.courseProgress,
          lessonProgress: state.lessonProgress,
          activeCourse: state.activeCourse,
          activeLesson: state.activeLesson,
          activeSection: state.activeSection,
          filters: state.filters,
        }),
      }
    ),
    { name: 'course-store' }
  )
);

// Selectors
export const selectEnrolledCourse = (courseId: number) => (state: CourseState) =>
  state.enrolledCourses[courseId];

export const selectCourseProgress = (courseId: number) => (state: CourseState) =>
  state.courseProgress[courseId];

export const selectLessonProgress = (lessonId: number) => (state: CourseState) =>
  state.lessonProgress[lessonId];

export const selectIsEnrolled = (courseId: number) => (state: CourseState) =>
  !!state.enrolledCourses[courseId];
