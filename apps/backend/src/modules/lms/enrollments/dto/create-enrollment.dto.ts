import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  course_id: number;

  @ApiProperty({ example: 'purchase', enum: ['purchase', 'subscription'] })
  @IsEnum(['purchase', 'subscription'])
  enrollment_type: string;

  @ApiPropertyOptional({ example: 'completed', enum: ['active', 'completed', 'expired', 'cancelled'] })
  @IsOptional()
  @IsEnum(['active', 'completed', 'expired', 'cancelled'])
  status?: string;
}
