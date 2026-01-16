import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderItem {
  @ApiProperty({ description: 'Lookup ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'New display order', example: 0 })
  @IsNumber()
  order: number;
}

export class ReorderLookupsDto {
  @ApiProperty({ description: 'Array of items with new order', type: [ReorderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
