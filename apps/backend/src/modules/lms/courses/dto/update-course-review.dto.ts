import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseReviewDto {
  @ApiPropertyOptional({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Review text/comment' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Review text (alternative to comment)' })
  @IsOptional()
  @IsString()
  reviewText?: string;
}
