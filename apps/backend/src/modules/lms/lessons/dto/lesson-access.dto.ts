import { ApiProperty } from '@nestjs/swagger';

export class LessonAccessCheckDto {
  @ApiProperty()
  lessonId: number;

  @ApiProperty()
  canAccess: boolean;

  @ApiProperty({ enum: ['admin', 'instructor', 'enrolled', 'preview', 'denied'] })
  reason: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';

  @ApiProperty({ required: false })
  enrollment?: {
    id: number;
    enrollmentType: string;
    expiresAt?: Date;
    daysRemaining?: number;
    isExpired: boolean;
  };
}
