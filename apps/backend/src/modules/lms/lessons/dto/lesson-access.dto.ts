import { ApiProperty } from '@nestjs/swagger';
import type { LessonAccessCheck } from '@leap-lms/shared-types';

export class LessonAccessCheckDto {
  @ApiProperty()
  lessonId: number;

  @ApiProperty()
  canAccess: boolean;

  @ApiProperty({ enum: ['admin', 'instructor', 'enrolled', 'preview', 'denied'] })
  reason: LessonAccessCheck['reason'];

  @ApiProperty({ required: false })
  enrollment?: {
    id: number;
    enrollmentType: string;
    expiresAt?: Date;
    daysRemaining?: number;
    isExpired: boolean;
  };
}
