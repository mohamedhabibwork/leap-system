import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanFeatureDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  plan_id: number;

  @ApiProperty({ example: 'Unlimited Access' })
  @IsString()
  feature_name: string;

  @ApiPropertyOptional({ example: 'Access to all courses' })
  @IsOptional()
  @IsString()
  feature_value?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;
}
