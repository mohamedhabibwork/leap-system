import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlanType {
  FIXED = 'FIXED',
  INFINITE = 'INFINITE',
}

export enum PaymentDefinitionType {
  TRIAL = 'TRIAL',
  REGULAR = 'REGULAR',
}

export enum Frequency {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export class CurrencyDto {
  @ApiProperty({ example: 'USD', description: 'Currency code (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: '100.00', description: 'Amount value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ChargeModelDto {
  @ApiPropertyOptional({ example: 'CHM-123', description: 'Charge model ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: ['TAX', 'SHIPPING'], description: 'Charge model type' })
  @IsEnum(['TAX', 'SHIPPING'])
  type: 'TAX' | 'SHIPPING';

  @ApiProperty({ type: CurrencyDto, description: 'Charge amount' })
  @ValidateNested()
  @Type(() => CurrencyDto)
  amount: CurrencyDto;
}

export class PaymentDefinitionDto {
  @ApiPropertyOptional({ example: 'PD-123', description: 'Payment definition ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Regular payment definition', description: 'Payment definition name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiProperty({ enum: PaymentDefinitionType, description: 'Payment definition type' })
  @IsEnum(PaymentDefinitionType)
  type: PaymentDefinitionType;

  @ApiProperty({ enum: Frequency, description: 'Payment frequency' })
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty({ example: '1', description: 'Frequency interval (1-12)' })
  @IsString()
  @IsNotEmpty()
  frequency_interval: string;

  @ApiProperty({ example: '12', description: 'Number of payment cycles (0 for infinite)' })
  @IsString()
  @IsNotEmpty()
  cycles: string;

  @ApiProperty({ type: CurrencyDto, description: 'Payment amount' })
  @ValidateNested()
  @Type(() => CurrencyDto)
  amount: CurrencyDto;

  @ApiPropertyOptional({ type: [ChargeModelDto], description: 'Charge models (tax, shipping)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeModelDto)
  charge_models?: ChargeModelDto[];
}

export class MerchantPreferencesDto {
  @ApiProperty({ example: 'https://example.com/return', description: 'Return URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  return_url: string;

  @ApiProperty({ example: 'https://example.com/cancel', description: 'Cancel URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  cancel_url: string;

  @ApiPropertyOptional({ example: 'https://example.com/notify', description: 'Notify URL' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notify_url?: string;

  @ApiPropertyOptional({ example: '0', description: 'Max failed payment attempts (0 = infinite)', default: '0' })
  @IsOptional()
  @IsString()
  max_fail_attempts?: string;

  @ApiPropertyOptional({ enum: ['YES', 'NO'], description: 'Auto bill outstanding balance', default: 'NO' })
  @IsOptional()
  @IsEnum(['YES', 'NO'])
  auto_bill_amount?: 'YES' | 'NO';

  @ApiPropertyOptional({ enum: ['CONTINUE', 'CANCEL'], description: 'Action on initial payment failure', default: 'CONTINUE' })
  @IsOptional()
  @IsEnum(['CONTINUE', 'CANCEL'])
  initial_fail_amount_action?: 'CONTINUE' | 'CANCEL';

  @ApiPropertyOptional({ type: CurrencyDto, description: 'Setup fee' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencyDto)
  setup_fee?: CurrencyDto;
}

export class CreateBillingPlanDto {
  @ApiProperty({ example: 'Monthly Subscription Plan', description: 'Plan name (max 128 chars)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'Monthly subscription plan with regular payments', description: 'Plan description (max 127 chars)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(127)
  description: string;

  @ApiProperty({ enum: PlanType, description: 'Plan type (FIXED or INFINITE)' })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({ type: [PaymentDefinitionDto], description: 'Payment definitions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDefinitionDto)
  payment_definitions: PaymentDefinitionDto[];

  @ApiProperty({ type: MerchantPreferencesDto, description: 'Merchant preferences' })
  @ValidateNested()
  @Type(() => MerchantPreferencesDto)
  merchant_preferences: MerchantPreferencesDto;
}
