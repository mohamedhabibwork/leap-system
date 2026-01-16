import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLookupTypeDto {
  @ApiProperty({ description: 'Name of the lookup type', example: 'Job Type' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Unique code for the lookup type', example: 'job_type' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Description of the lookup type' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent lookup type ID for hierarchical types' })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON string' })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
