import { IsArray, IsEnum, IsInt, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PageBulkAction {
  DELETE = 'delete',
  VERIFY = 'verify',
  UNVERIFY = 'unverify',
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
}

export class BulkPageOperationDto {
  @ApiProperty({ description: 'Array of page IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: PageBulkAction })
  @IsEnum(PageBulkAction)
  action: PageBulkAction;
}
