import { IsArray, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BulkOperation {
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export class BulkLookupOperationDto {
  @ApiProperty({ description: 'Operation to perform', enum: BulkOperation, example: BulkOperation.ACTIVATE })
  @IsEnum(BulkOperation)
  operation: BulkOperation;

  @ApiProperty({ description: 'Array of lookup IDs', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
