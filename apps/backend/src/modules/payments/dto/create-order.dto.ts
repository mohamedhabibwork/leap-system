import { IsString, IsArray, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: 'product_id_1', description: 'Product or course ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '1', description: 'Quantity' })
  @IsString()
  @IsNotEmpty()
  quantity: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ 
    example: '99.99', 
    description: 'Total amount (optional if cart items provided)' 
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({ 
    example: 'USD', 
    description: 'Currency code',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ 
    type: [CartItemDto],
    description: 'Cart items array (for SDK v6)'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cart?: CartItemDto[];

  @ApiPropertyOptional({
    example: true,
    description: 'Enable vault for recurring payments/subscriptions. Stores payment method for future use.',
  })
  @IsOptional()
  storeInVault?: boolean;

  @ApiPropertyOptional({
    example: 'vault_id_123',
    description: 'Vault ID (payment method token) for future recurring payments using stored payment method',
  })
  @IsOptional()
  @IsString()
  vaultId?: string;

  @ApiPropertyOptional({
    example: 'Monthly subscription payment',
    description: 'Order description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
