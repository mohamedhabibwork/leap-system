import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSectionItem {
  @ApiProperty({ description: 'Section ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'New display order', example: 0 })
  @IsNumber()
  displayOrder: number;
}

export class ReorderSectionsDto {
  @ApiProperty({ description: 'Array of sections with new order', type: [ReorderSectionItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSectionItem)
  sections: ReorderSectionItem[];
}
