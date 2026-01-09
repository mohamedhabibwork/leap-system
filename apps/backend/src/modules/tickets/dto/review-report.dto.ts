import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportAction {
  WARNING = 'warning',
  SUSPEND = 'suspend',
  BAN = 'ban',
  DELETE_CONTENT = 'delete_content',
  DISMISS = 'dismiss',
}

export class ReviewReportDto {
  @ApiProperty({ description: 'Action to take', enum: ReportAction })
  @IsNotEmpty()
  @IsEnum(ReportAction)
  action: ReportAction;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'Reason for action' })
  @IsOptional()
  @IsString()
  reason?: string;
}
