import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'مقدمة في تايب سكريبت' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiProperty({ example: 'intro-typescript' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Learn TypeScript from scratch' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'تعلم تايب سكريبت من الصفر' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  instructorId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  statusId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  enrollmentTypeId?: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  durationHours?: number;
}
