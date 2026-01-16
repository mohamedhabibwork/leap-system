import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a great course!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @Transform(({ obj }) => {
    const value = obj.commentableId ?? obj.entityId;
    if (value === undefined || value === null) {
      return value;
    }
    return Number(value);
  })
  @IsNumber()
  commentableId: number;

  @ApiProperty({ example: 'Course' })
  @Transform(({ obj }) => obj.commentableType ?? obj.entityType)
  @IsString()
  commentableType: string;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ obj }) => {
    const value = obj.parentCommentId ?? obj.parentId;
    if (value === null || value === undefined) {
      return undefined;
    }
    return Number(value);
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;

  // Allow these fields for backward compatibility (no validation, will be ignored)
  @IsOptional()
  entityId?: any;

  @IsOptional()
  entityType?: any;

  @IsOptional()
  parentId?: any;

  @IsOptional()
  entityUserId?: any;
}
