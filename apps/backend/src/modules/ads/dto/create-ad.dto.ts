import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsObject, IsEnum, Min, Max, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdDto {
  @ApiPropertyOptional({ description: 'Campaign ID to associate this ad with' })
  @IsOptional()
  @IsInt()
  campaignId?: number;

  @ApiProperty({ description: 'Ad type lookup ID (banner, sponsored, popup, video)' })
  @IsNotEmpty()
  @IsInt()
  adTypeId: number;

  @ApiPropertyOptional({ description: 'Target entity type', enum: ['course', 'event', 'job', 'post', 'external'] })
  @IsOptional()
  @IsString()
  @IsEnum(['course', 'event', 'job', 'post', 'external'])
  targetType?: string;

  @ApiPropertyOptional({ description: 'Target entity ID (if targeting internal content)' })
  @IsOptional()
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional({ description: 'External URL (if targeting external link)' })
  @IsOptional()
  @IsUrl()
  @IsString()
  externalUrl?: string;

  @ApiProperty({ description: 'Ad title in English' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ description: 'Ad title in Arabic' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ description: 'Ad description in English' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Ad description in Arabic' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'Media URL (image or video)' })
  @IsOptional()
  @IsUrl()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Call to action text' })
  @IsOptional()
  @IsString()
  callToAction?: string;

  @ApiProperty({ description: 'Placement type lookup ID' })
  @IsNotEmpty()
  @IsInt()
  placementTypeId: number;

  @ApiPropertyOptional({ description: 'Ad priority (higher = more prominent)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiProperty({ description: 'Start date for ad display' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date for ad display' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Is this a paid ad?', default: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({ description: 'Targeting rules object' })
  @IsOptional()
  @IsObject()
  targetingRules?: {
    targetUserRoles?: string[];
    targetSubscriptionPlans?: number[];
    targetAgeRange?: { min: number; max: number };
    targetLocations?: string[];
    targetInterests?: string[];
    targetBehavior?: Record<string, any>;
  };
}
