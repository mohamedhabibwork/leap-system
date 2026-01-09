import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({ description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Enrollment ID' })
  @IsInt()
  enrollmentId: number;

  @ApiProperty({ description: 'Attendance status ID (present, absent, late)' })
  @IsInt()
  attendanceStatusId: number;

  @ApiProperty({ description: 'Time user joined', required: false })
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiProperty({ description: 'Time user left', required: false })
  @IsOptional()
  @IsDateString()
  leftAt?: string;

  @ApiProperty({ description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsInt()
  durationMinutes?: number;
}
