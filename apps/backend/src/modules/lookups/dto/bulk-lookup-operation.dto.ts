import { IsArray, IsEnum, IsInt, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LookupBulkAction {
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export class BulkLookupOperationDto {
  @ApiProperty({ description: 'Array of lookup IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: LookupBulkAction })
  @IsEnum(LookupBulkAction)
  action: LookupBulkAction;
}
