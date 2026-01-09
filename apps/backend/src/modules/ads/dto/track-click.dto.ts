import { IsNotEmpty, IsInt, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackClickDto {
  @ApiProperty({ description: 'Ad ID' })
  @IsNotEmpty()
  @IsInt()
  adId: number;

  @ApiPropertyOptional({ description: 'Impression ID (if available)' })
  @IsOptional()
  @IsInt()
  impressionId?: number;

  @ApiPropertyOptional({ description: 'User ID (if authenticated)' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ description: 'Session ID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'Destination URL' })
  @IsOptional()
  @IsString()
  destinationUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
