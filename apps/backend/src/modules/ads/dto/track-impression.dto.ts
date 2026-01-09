import { IsNotEmpty, IsInt, IsOptional, IsString, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackImpressionDto {
  @ApiProperty({ description: 'Ad ID' })
  @IsNotEmpty()
  @IsInt()
  adId: number;

  @ApiPropertyOptional({ description: 'Placement code where ad was shown' })
  @IsOptional()
  @IsString()
  placementCode?: string;

  @ApiPropertyOptional({ description: 'User ID (if authenticated)' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ description: 'Session ID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkTrackImpressionDto {
  @ApiProperty({ description: 'Array of impressions to track', type: [TrackImpressionDto] })
  @IsNotEmpty()
  @IsArray()
  impressions: TrackImpressionDto[];
}
