import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdminReportQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by reason or reporter' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by report type ID' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  reportType?: number;

  @ApiPropertyOptional({ description: 'Filter by reportable type' })
  @IsOptional()
  @IsString()
  reportableType?: string;

  @ApiPropertyOptional({ description: 'Filter by reporter ID' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  reportedBy?: number;

  @ApiPropertyOptional({ description: 'Filter from date' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date' })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
