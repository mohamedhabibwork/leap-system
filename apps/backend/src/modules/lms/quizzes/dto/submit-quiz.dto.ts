import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsInt()
  questionId: number;

  @ApiProperty({ description: 'Selected option ID', required: false })
  @IsInt()
  @IsOptional()
  selectedOptionId?: number;

  @ApiProperty({ description: 'Text answer for essay questions', required: false })
  @IsString()
  @IsOptional()
  answerText?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Quiz attempt ID' })
  @IsInt()
  attemptId: number;

  @ApiProperty({ description: 'Array of answers', type: [QuizAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
