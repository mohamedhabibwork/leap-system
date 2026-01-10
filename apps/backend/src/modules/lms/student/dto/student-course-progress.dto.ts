import { ApiProperty } from '@nestjs/swagger';

export class NextLessonDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;
}

export class EnrollmentExpiryDto {
  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  daysRemaining?: number;

  @ApiProperty()
  isExpired: boolean;
}

export class StudentCourseProgressDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty()
  instructorName: string;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty({ required: false })
  lastAccessedAt?: Date;

  @ApiProperty({ type: NextLessonDto, required: false })
  nextLesson?: NextLessonDto;

  @ApiProperty({ type: EnrollmentExpiryDto, required: false })
  enrollmentExpiry?: EnrollmentExpiryDto;

  @ApiProperty()
  enrollmentId: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;
}

export class DetailedCourseProgressDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  completedLessons: number[];

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  quizScores: any[];

  @ApiProperty()
  assignmentScores: any[];

  @ApiProperty()
  timeSpentMinutes: number;

  @ApiProperty({ type: [Object] })
  nextSteps: any[];
}
