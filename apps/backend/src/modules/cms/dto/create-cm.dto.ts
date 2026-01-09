import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCmDto {
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsNumber() pageTypeId: number;
  @ApiProperty() @IsNumber() statusId: number;
  @ApiProperty() @IsString() titleEn: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleAr?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contentEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contentAr?: string;
  @ApiPropertyOptional() @IsOptional() metadata?: any;
  @ApiPropertyOptional() @IsOptional() settings?: any;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}
