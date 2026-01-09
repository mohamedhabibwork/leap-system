import { IsArray, IsEnum, IsInt, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EventBulkAction {
  DELETE = 'delete',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
  CANCEL = 'cancel',
  CHANGE_STATUS = 'change_status',
}

export class BulkEventOperationDto {
  @ApiProperty({ description: 'Array of event IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: EventBulkAction })
  @IsEnum(EventBulkAction)
  action: EventBulkAction;

  @ApiPropertyOptional({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
