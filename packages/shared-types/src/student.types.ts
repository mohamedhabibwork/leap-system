import { LessonSession } from './session.types';

// Student Dashboard types

export interface StudentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'assignment_submitted' | 'certificate_earned';
  title: string;
  description: string;
  timestamp: Date;
  courseId?: number;
  courseName?: string;
}

export interface StudentDashboard {
  totalEnrolledCourses: number;
  coursesInProgress: number;
  completedCourses: number;
  overallProgress: number;
  upcomingSessions: LessonSession[];
  pendingAssignments: number;
  pendingQuizzes: number;
  recentActivity: StudentActivity[];
  learningStreak: number;
  certificatesEarned: number;
}

export interface StudentCourseProgress {
  courseId: number;
  courseName: string;
  thumbnailUrl?: string;
  instructorName: string;
  progressPercentage: number;
  lastAccessedAt?: Date;
  nextLesson?: {
    id: number;
    title: string;
  };
  enrollmentExpiry?: {
    expiresAt?: Date;
    daysRemaining?: number;
    isExpired: boolean;
  };
  enrollmentId: number;
  completedLessons: number;
  totalLessons: number;
}

export interface PendingAssignment {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  courseId: number;
  courseName: string;
  dueDate?: Date;
  status: 'not_started' | 'in_progress';
  maxPoints: number;
}

export interface PendingQuiz {
  id: number;
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseName: string;
  dueDate?: Date;
  attemptsRemaining?: number;
  maxAttempts: number;
  totalQuestions: number;
}

export interface CourseRecommendation {
  courseId: number;
  courseName: string;
  thumbnailUrl?: string;
  instructorName: string;
  rating: number;
  enrollmentCount: number;
  reason: 'similar_category' | 'popular' | 'trending' | 'instructor';
  price?: number;
  categoryName?: string;
}

export interface LearningStats {
  totalLearningTimeMinutes: number;
  averageQuizScore: number;
  courseCompletionRate: number;
  learningStreak: number;
  mostActiveDayOfWeek: string;
  lessonsCompletedThisWeek: number;
  lessonsCompletedThisMonth: number;
}

export interface DetailedCourseProgress {
  courseId: number;
  completedLessons: number[];
  totalLessons: number;
  quizScores: Array<{
    quizId: number;
    score: number;
    maxScore: number;
    completedAt: Date;
  }>;
  assignmentScores: Array<{
    assignmentId: number;
    score: number;
    maxPoints: number;
    submittedAt: Date;
  }>;
  timeSpentMinutes: number;
  nextSteps: unknown[];
}

export interface Achievement {
  id: number;
  courseId: number;
  courseName: string;
  completedAt: Date;
  certificateUrl?: string;
  certificateCode?: string;
}
