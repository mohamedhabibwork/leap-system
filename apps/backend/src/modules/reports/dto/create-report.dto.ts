import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'Type of entity being reported', example: 'post' })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'ID of the entity being reported', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  entityId: number;

  @ApiProperty({ description: 'Reason for reporting', example: 'spam' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional details', required: false })
  @IsString()
  details?: string;
}
