import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  sectionId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  contentTypeId: number;

  @ApiProperty({ example: 'Introduction to Variables' })
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'مقدمة في المتغيرات' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ example: 'Learn about variables in programming' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'تعلم عن المتغيرات في البرمجة' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ example: 'Full lesson content here...' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ example: 'محتوى الدرس الكامل هنا...' })
  @IsOptional()
  @IsString()
  contentAr?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/attachment.pdf' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}
