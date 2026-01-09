import { IsArray, IsEnum, IsInt, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketBulkAction {
  DELETE = 'delete',
  CLOSE = 'close',
  ASSIGN = 'assign',
  CHANGE_STATUS = 'change_status',
  CHANGE_PRIORITY = 'change_priority',
}

export class BulkTicketOperationDto {
  @ApiProperty({ description: 'Array of ticket IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: TicketBulkAction })
  @IsEnum(TicketBulkAction)
  action: TicketBulkAction;

  @ApiPropertyOptional({ description: 'Reason for action' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Assign to user ID (for ASSIGN action)' })
  @IsOptional()
  @IsInt()
  assignToId?: number;

  @ApiPropertyOptional({ description: 'New status ID (for CHANGE_STATUS action)' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'New priority ID (for CHANGE_PRIORITY action)' })
  @IsOptional()
  @IsInt()
  priorityId?: number;
}
