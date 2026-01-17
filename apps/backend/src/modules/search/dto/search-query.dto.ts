import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchType {
  ALL = 'all',
  COURSE = 'course',
  USER = 'user',
  POST = 'post',
  GROUP = 'group',
  PAGE = 'page',
  EVENT = 'event',
  JOB = 'job',
}

export enum SearchSort {
  RELEVANCE = 'relevance',
  DATE = 'date',
  POPULARITY = 'popularity',
}

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Search query string' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Type of content to search', enum: SearchType, default: SearchType.ALL })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @ApiPropertyOptional({ description: 'Maximum number of results', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Offset for pagination', minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Sort order', enum: SearchSort, default: SearchSort.RELEVANCE })
  @IsOptional()
  @IsEnum(SearchSort)
  sort?: SearchSort = SearchSort.RELEVANCE;
}

export class SearchSuggestionsQueryDto {
  @ApiPropertyOptional({ description: 'Search query string' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Maximum number of suggestions', minimum: 1, maximum: 20, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}
