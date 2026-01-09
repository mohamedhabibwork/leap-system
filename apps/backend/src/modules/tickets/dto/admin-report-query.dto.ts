import { IsOptional, IsInt, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminReportQueryDto {
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

  @ApiPropertyOptional({ description: 'Search by reason or reporter' })
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

  @ApiPropertyOptional({ description: 'Filter by report type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reportType?: number;

  @ApiPropertyOptional({ description: 'Filter by status ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: 'Filter by reportable type' })
  @IsOptional()
  @IsString()
  reportableType?: string;

  @ApiPropertyOptional({ description: 'Filter by reporter ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reportedBy?: number;

  @ApiPropertyOptional({ description: 'Filter by reviewer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reviewedBy?: number;

  @ApiPropertyOptional({ description: 'Filter from date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
