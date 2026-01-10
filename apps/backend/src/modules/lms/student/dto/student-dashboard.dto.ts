import { ApiProperty } from '@nestjs/swagger';

export class StudentActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: 'lesson_completed' | 'quiz_passed' | 'assignment_submitted' | 'certificate_earned';

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ required: false })
  courseId?: number;

  @ApiProperty({ required: false })
  courseName?: string;
}

export class StudentDashboardDto {
  @ApiProperty()
  totalEnrolledCourses: number;

  @ApiProperty()
  coursesInProgress: number;

  @ApiProperty()
  completedCourses: number;

  @ApiProperty()
  overallProgress: number;

  @ApiProperty({ type: [Object] })
  upcomingSessions: any[];

  @ApiProperty()
  pendingAssignments: number;

  @ApiProperty()
  pendingQuizzes: number;

  @ApiProperty({ type: [StudentActivityDto] })
  recentActivity: StudentActivityDto[];

  @ApiProperty()
  learningStreak: number;

  @ApiProperty()
  certificatesEarned: number;
}
