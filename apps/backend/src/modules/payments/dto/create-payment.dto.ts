import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 }) @IsNumber() userId: number;
  @ApiProperty({ example: 1 }) @IsNumber() subscription_id: number;
  @ApiProperty({ example: 99.99 }) @IsNumber() amount: number;
  @ApiProperty({ example: 'USD' }) @IsString() currency: string;
  @ApiProperty({ example: 'paypal', enum: ['paypal', 'stripe', 'bank_transfer'] }) 
  @IsEnum(['paypal', 'stripe', 'bank_transfer']) payment_method: string;
  @ApiProperty({ example: 'subscription', enum: ['subscription', 'course', 'other'] })
  @IsEnum(['subscription', 'course', 'other']) payment_type: string;
  @ApiPropertyOptional({ example: 'Monthly subscription payment' }) 
  @IsOptional() @IsString() description?: string;
}
