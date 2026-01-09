import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditDto {
  @ApiProperty() @IsNumber() userId: number;
  @ApiProperty() @IsString() action: string;
  @ApiProperty() @IsString() auditableType: string;
  @ApiProperty() @IsNumber() auditableId: number;
  @ApiPropertyOptional() @IsOptional() oldValues?: any;
  @ApiPropertyOptional() @IsOptional() newValues?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ipAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() userAgent?: string;
}
