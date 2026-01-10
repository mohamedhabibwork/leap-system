import { LessonSession } from './session.types';

// Instructor Dashboard types

export interface Activity {
  id: string;
  type: 'enrollment' | 'submission' | 'review' | 'session' | 'quiz';
  title: string;
  description: string;
  timestamp: Date;
  userId?: number;
  userName?: string;
  courseId?: number;
  courseName?: string;
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface InstructorDashboard {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  upcomingSessions: LessonSession[];
  pendingAssignments: number;
  recentActivity: Activity[];
  revenueChartData: ChartDataPoint[];
  enrollmentChartData: ChartDataPoint[];
  topCourses: CourseStats[];
}

export interface CourseStats {
  courseId: number;
  courseName: string;
  slug?: string;
  thumbnailUrl?: string;
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  activeStudents: number;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
}

export interface StudentProgress {
  userId: number;
  userName: string;
  userEmail: string;
  courseId: number;
  enrollmentId: number;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: Date;
  enrolledAt: Date;
}

export interface CourseAnalytics {
  courseId: number;
  enrollmentTrend: {
    month: Date;
    count: number;
  }[];
  completionRate: number;
  averageQuizScores: {
    quizId: number;
    quizName: string;
    averageScore: number;
  }[];
  studentEngagement: {
    active: number;
    inactive: number;
  };
  revenueTrend: {
    month: Date;
    amount: number;
  }[];
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

export interface AssignmentSubmission {
  id: number;
  uuid: string;
  assignmentId: number;
  assignmentTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  submissionText?: string;
  fileUrl?: string;
  score?: number;
  maxPoints?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: number;
  statusId: number;
  courseId: number;
  courseName: string;
}

export interface QuizAttempt {
  id: number;
  uuid: string;
  quizId: number;
  quizTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt?: Date;
  courseId: number;
  courseName: string;
}

export interface GradeSubmissionDto {
  score: number;
  maxPoints: number;
  feedback?: string;
  gradedBy?: number;
}
