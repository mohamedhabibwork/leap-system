import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ description: 'Course ID' })
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ description: 'Section ID (for section-level resources)', required: false })
  @IsInt()
  @IsOptional()
  sectionId?: number;

  @ApiProperty({ description: 'Lesson ID (for lesson-level resources)', required: false })
  @IsInt()
  @IsOptional()
  lessonId?: number;

  @ApiProperty({ description: 'Resource type ID from lookups' })
  @IsInt()
  @IsNotEmpty()
  resourceTypeId: number;

  @ApiProperty({ description: 'Title in English' })
  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @ApiProperty({ description: 'Title in Arabic', required: false })
  @IsString()
  @IsOptional()
  titleAr?: string;

  @ApiProperty({ description: 'Description in English', required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ description: 'Description in Arabic', required: false })
  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @ApiProperty({ description: 'File URL' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'File name', required: false })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ description: 'Display order', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
