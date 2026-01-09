import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty() @IsString() titleEn: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleAr?: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty() @IsNumber() eventTypeId: number;
  @ApiProperty() @IsNumber() statusId: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() categoryId?: number;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meetingUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacity?: number;
}
