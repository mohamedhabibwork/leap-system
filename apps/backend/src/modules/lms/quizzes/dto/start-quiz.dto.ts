import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class StartQuizDto {
  @ApiProperty({ description: 'Quiz ID to start' })
  @IsInt()
  quizId: number;
}
