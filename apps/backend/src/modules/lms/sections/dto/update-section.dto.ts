import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'Introduction to the Course' })
  @IsOptional()
  @IsString()
  titleEn?: string;

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
