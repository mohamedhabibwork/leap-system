import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPageDto {
  @ApiProperty({ description: 'Verification status' })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Verification notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
