import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ReviewAttemptDto {
  @ApiProperty({ description: 'Instructor feedback on the quiz attempt', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: 'Additional notes or comments', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
