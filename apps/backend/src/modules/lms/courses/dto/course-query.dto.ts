import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CourseQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value.trim() : undefined))
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value.trim() : undefined))
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value.trim() : undefined))
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @Transform(({ value }) => (value && value.trim() !== '' ? value.trim() : undefined))
  @IsString()
  sort?: string = 'desc';
}
