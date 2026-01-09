import { IsArray, IsEnum, IsInt, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PostBulkAction {
  DELETE = 'delete',
  HIDE = 'hide',
  UNHIDE = 'unhide',
  CHANGE_VISIBILITY = 'change_visibility',
}

export class BulkPostOperationDto {
  @ApiProperty({ description: 'Array of post IDs', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ description: 'Action to perform', enum: PostBulkAction })
  @IsEnum(PostBulkAction)
  action: PostBulkAction;

  @ApiPropertyOptional({ description: 'Reason for action' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'New visibility ID (for CHANGE_VISIBILITY action)' })
  @IsOptional()
  @IsInt()
  visibilityId?: number;
}
