import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Remember to review chapter 5' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  noteableId: number;

  @ApiProperty({ example: 'Lesson' })
  @IsString()
  noteableType: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  visibilityId: number;

  @ApiPropertyOptional({ example: '#FFD700' })
  @IsOptional()
  @IsString()
  color?: string;
}
