import { IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BulkCheckItemDto {
  @ApiProperty({ example: 'post', description: 'Entity type' })
  @IsString()
  type: string;

  @ApiProperty({ example: 1, description: 'Entity ID' })
  @IsNumber()
  id: number;
}

export class BulkCheckFavoriteDto {
  @ApiProperty({ type: [BulkCheckItemDto], description: 'Array of items to check' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCheckItemDto)
  items: BulkCheckItemDto[];
}
