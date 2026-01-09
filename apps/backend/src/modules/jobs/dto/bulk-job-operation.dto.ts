import { IsArray, IsEnum, IsInt, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JobBulkAction {
  DELETE = 'delete',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
  CLOSE = 'close',
  CHANGE_STATUS = 'change_status',
}

export class BulkJobOperationDto {
  @ApiProperty({ description: 'Array of job IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: JobBulkAction })
  @IsEnum(JobBulkAction)
  action: JobBulkAction;

  @ApiPropertyOptional({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
