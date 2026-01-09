import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'Filter by ad type ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  adTypeId?: number;

  @ApiPropertyOptional({ description: 'Filter by placement type' })
  @IsOptional()
  @IsString()
  placementCode?: string;

  @ApiPropertyOptional({ description: 'Filter by creator user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Filter by campaign ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  campaignId?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class GetActiveAdsDto {
  @ApiPropertyOptional({ description: 'Placement code to get ads for' })
  @IsOptional()
  @IsString()
  placement?: string;

  @ApiPropertyOptional({ description: 'Number of ads to return', default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 3;
}
