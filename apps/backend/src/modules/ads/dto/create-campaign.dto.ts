import { IsNotEmpty, IsString, IsOptional, IsInt, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Campaign budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiProperty({ description: 'Campaign status lookup ID' })
  @IsNotEmpty()
  @IsInt()
  statusId: number;

  @ApiProperty({ description: 'Campaign start date' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'Campaign end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
