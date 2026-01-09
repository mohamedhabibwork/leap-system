import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LookupOrder {
  @ApiProperty({ description: 'Lookup ID' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'New sort order' })
  @IsInt()
  sortOrder: number;
}

export class ReorderLookupsDto {
  @ApiProperty({ description: 'Array of lookup items with new order', type: [LookupOrder] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LookupOrder)
  items: LookupOrder[];
}
