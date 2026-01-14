import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ArrayMinSize } from 'class-validator';

export class AddQuestionsToQuizDto {
  @ApiProperty({ description: 'Array of question IDs to add to the quiz', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  questionIds: number[];
}
