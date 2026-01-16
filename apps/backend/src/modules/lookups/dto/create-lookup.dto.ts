import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLookupDto {
  @ApiProperty({ description: 'Lookup type ID', example: 1 })
  @IsNumber()
  lookupTypeId: number;

  @ApiPropertyOptional({ description: 'Parent lookup ID for hierarchical lookups', example: null })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: 'Unique code for the lookup', example: 'FULL_TIME' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'English name', example: 'Full Time' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn: string;

  @ApiPropertyOptional({ description: 'Arabic name', example: 'دوام كامل' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameAr?: string;

  @ApiPropertyOptional({ description: 'English description' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Arabic description' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'Timezone for location-based lookups' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON string' })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
