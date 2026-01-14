import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray, ValidateNested, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionOptionDto {
  @ApiProperty({ description: 'Option text in English' })
  @IsString()
  @IsNotEmpty()
  optionTextEn: string;

  @ApiProperty({ description: 'Option text in Arabic', required: false })
  @IsString()
  @IsOptional()
  optionTextAr?: string;

  @ApiProperty({ description: 'Whether this option is correct' })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ description: 'Display order', required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'Course ID (null for general questions)', required: false })
  @IsInt()
  @IsOptional()
  courseId?: number;

  @ApiProperty({ description: 'Question type ID from lookups' })
  @IsInt()
  @IsNotEmpty()
  questionTypeId: number;

  @ApiProperty({ description: 'Question text in English' })
  @IsString()
  @IsNotEmpty()
  questionTextEn: string;

  @ApiProperty({ description: 'Question text in Arabic', required: false })
  @IsString()
  @IsOptional()
  questionTextAr?: string;

  @ApiProperty({ description: 'Explanation in English', required: false })
  @IsString()
  @IsOptional()
  explanationEn?: string;

  @ApiProperty({ description: 'Explanation in Arabic', required: false })
  @IsString()
  @IsOptional()
  explanationAr?: string;

  @ApiProperty({ description: 'Points for this question', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @ApiProperty({ description: 'Question options', type: [QuestionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}
