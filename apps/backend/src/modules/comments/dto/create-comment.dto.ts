import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a great course!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  commentableId: number;

  @ApiProperty({ example: 'Course' })
  @IsString()
  commentableType: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
