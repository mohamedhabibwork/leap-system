import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Score awarded to the submission' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Maximum points possible' })
  @IsNumber()
  @Min(0)
  maxPoints: number;

  @ApiProperty({ description: 'Feedback for the student', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: 'Instructor ID who graded', required: false })
  @IsOptional()
  @IsNumber()
  gradedBy?: number;
}
