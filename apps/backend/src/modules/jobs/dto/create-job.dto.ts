import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty() @IsString() titleEn: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleAr?: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty() @IsNumber() jobTypeId: number;
  @ApiProperty() @IsNumber() experienceLevelId: number;
  @ApiProperty() @IsNumber() statusId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salaryRange?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() companyId?: number;
}
