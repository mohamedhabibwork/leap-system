import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderLessonItem {
  @ApiProperty({ description: 'Lesson ID', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'New display order', example: 0 })
  @IsNumber()
  displayOrder: number;
}

export class ReorderLessonsDto {
  @ApiProperty({ description: 'Array of lessons with new order', type: [ReorderLessonItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderLessonItem)
  lessons: ReorderLessonItem[];
}
