import { IsArray, IsEnum, IsInt, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportBulkAction {
  DELETE = 'delete',
  RESOLVE = 'resolve',
  DISMISS = 'dismiss',
  CHANGE_STATUS = 'change_status',
}

export class BulkReportOperationDto {
  @ApiProperty({ description: 'Array of report IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: ReportBulkAction })
  @IsEnum(ReportBulkAction)
  action: ReportBulkAction;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
