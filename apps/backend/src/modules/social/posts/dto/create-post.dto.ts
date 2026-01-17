import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty() @IsString() content: string;
  @ApiProperty({ enum: ['text', 'image', 'video', 'link'] }) @IsEnum(['text', 'image', 'video', 'link']) post_type: string;
  @ApiProperty({ enum: ['public', 'friends', 'private'] }) @IsEnum(['public', 'friends', 'private']) visibility: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() group_id?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page_id?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsNumber({}, { each: true }) mentionIds?: number[];
}
