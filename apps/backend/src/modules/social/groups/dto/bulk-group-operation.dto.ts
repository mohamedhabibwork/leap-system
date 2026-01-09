import { IsArray, IsEnum, IsInt, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GroupBulkAction {
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
}

export class BulkGroupOperationDto {
  @ApiProperty({ description: 'Array of group IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: GroupBulkAction })
  @IsEnum(GroupBulkAction)
  action: GroupBulkAction;
}
