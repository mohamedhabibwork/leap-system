import { ApiProperty } from '@nestjs/swagger';

export class LearningStatsDto {
  @ApiProperty()
  totalLearningTimeMinutes: number;

  @ApiProperty()
  averageQuizScore: number;

  @ApiProperty()
  courseCompletionRate: number;

  @ApiProperty()
  learningStreak: number;

  @ApiProperty()
  mostActiveDayOfWeek: string;

  @ApiProperty()
  lessonsCompletedThisWeek: number;

  @ApiProperty()
  lessonsCompletedThisMonth: number;
}

export class PendingAssignmentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  assignmentId: number;

  @ApiProperty()
  assignmentTitle: string;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty()
  status: 'not_started' | 'in_progress';

  @ApiProperty()
  maxPoints: number;
}

export class PendingQuizDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quizId: number;

  @ApiProperty()
  quizTitle: string;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  attemptsRemaining?: number;

  @ApiProperty()
  maxAttempts: number;

  @ApiProperty()
  totalQuestions: number;
}

export class AchievementDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty({ required: false })
  certificateUrl?: string;

  @ApiProperty({ required: false })
  certificateCode?: string;
}
