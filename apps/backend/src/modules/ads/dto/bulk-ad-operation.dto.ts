import { IsArray, IsEnum, IsInt, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdBulkAction {
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  PAUSE = 'pause',
  RESUME = 'resume',
  CHANGE_STATUS = 'change_status',
}

export class BulkAdOperationDto {
  @ApiProperty({ description: 'Array of ad IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: AdBulkAction })
  @IsEnum(AdBulkAction)
  action: AdBulkAction;

  @ApiPropertyOptional({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'Reason for rejection (for REJECT action)' })
  @IsOptional()
  @IsInt()
  reason?: string;
}
