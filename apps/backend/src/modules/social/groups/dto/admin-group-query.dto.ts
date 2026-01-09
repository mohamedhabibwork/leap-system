import { IsOptional, IsInt, IsString, IsDateString, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminGroupQueryDto {
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

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter by privacy type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  privacyType?: number;

  @ApiPropertyOptional({ description: 'Filter by creator ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdBy?: number;

  @ApiPropertyOptional({ description: 'Filter by minimum member count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  memberCountMin?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum member count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  memberCountMax?: number;

  @ApiPropertyOptional({ description: 'Filter by approved status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({ description: 'Filter from date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
