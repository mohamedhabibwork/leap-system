import { ApiProperty } from '@nestjs/swagger';

export class InstructorDashboardDto {
  @ApiProperty()
  totalCourses: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  pendingAssignments: number;

  @ApiProperty()
  upcomingSessions: any[];

  @ApiProperty()
  recentActivity: any[];
}

export class CourseStatsDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty()
  enrollmentCount: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  activeStudents: number;
}

export class StudentProgressDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  lastAccessedAt: Date;

  @ApiProperty()
  enrolledAt: Date;
}

export class CourseAnalyticsDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  enrollmentTrend: any[];

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  averageQuizScores: any[];

  @ApiProperty()
  studentEngagement: {
    active: number;
    inactive: number;
  };

  @ApiProperty()
  revenueTrend: any[];

  @ApiProperty()
  ratingDistribution: any[];
}
