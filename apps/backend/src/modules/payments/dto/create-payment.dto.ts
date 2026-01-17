import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 }) @IsNumber() userId: number;
  @ApiPropertyOptional({ example: 1, description: 'Required for subscription payments, optional for course payments' }) 
  @IsOptional() @IsNumber() subscription_id?: number;
  @ApiProperty({ example: 99.99 }) @IsNumber() amount: number;
  @ApiProperty({ example: 'USD' }) @IsString() currency: string;
  @ApiProperty({ example: 'paypal', enum: ['paypal', 'stripe', 'bank_transfer'] }) 
  @IsEnum(['paypal', 'stripe', 'bank_transfer']) payment_method: string;
  @ApiProperty({ example: 'subscription', enum: ['subscription', 'course', 'other'] })
  @IsEnum(['subscription', 'course', 'other']) payment_type: string;
  @ApiPropertyOptional({ example: 1, description: 'Payment status lookup ID (e.g., completed, pending). Defaults to completed if not provided.' })
  @IsOptional() @IsNumber() statusId?: number;
  @ApiPropertyOptional({ example: 'Monthly subscription payment' }) 
  @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 1, description: 'Course ID for course payments' })
  @IsOptional() @IsNumber() course_id?: number;
}
