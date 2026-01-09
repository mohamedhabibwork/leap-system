import { IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  plan_id: number;

  @ApiProperty({ example: 'active', enum: ['trial', 'active', 'expired', 'cancelled'] })
  @IsEnum(['trial', 'active', 'expired', 'cancelled'])
  status: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  auto_renew?: boolean;
}
