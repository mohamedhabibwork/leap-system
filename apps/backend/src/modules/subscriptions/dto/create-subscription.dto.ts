import { IsNumber, IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  planId: number;

  @ApiProperty({ example: 1, description: 'Status lookup ID (e.g., active status)' })
  @IsNumber()
  statusId: number;

  @ApiProperty({ example: 1, description: 'Billing cycle lookup ID (e.g., monthly)' })
  @IsNumber()
  billingCycleId: number;

  @ApiPropertyOptional({ example: '99.99', description: 'Amount paid for subscription' })
  @IsOptional()
  @IsString()
  amountPaid?: string;

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

  @ApiPropertyOptional({ 
    example: 'vault_id_123',
    description: 'PayPal vault ID (payment method token) for recurring payments. According to PayPal "Billing Agreement with Purchase" guide.'
  })
  @IsOptional()
  @IsString()
  vaultId?: string;
}
