import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  courseId: number;

  @ApiProperty({ example: 'Introduction to the Course' })
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'مقدمة الدورة' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ example: 'This section covers the basics' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'يغطي هذا القسم الأساسيات' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}
