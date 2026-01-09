import { IsArray, IsEnum, IsInt, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CMSBulkAction {
  DELETE = 'delete',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  CHANGE_STATUS = 'change_status',
}

export class BulkCMSOperationDto {
  @ApiProperty({ description: 'Array of page IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: CMSBulkAction })
  @IsEnum(CMSBulkAction)
  action: CMSBulkAction;

  @ApiProperty({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
