import { IsString, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PatchOperation {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
  MOVE = 'move',
  COPY = 'copy',
  TEST = 'test',
}

export class PatchOperationDto {
  @ApiProperty({ enum: PatchOperation, description: 'Patch operation type' })
  @IsEnum(PatchOperation)
  op: PatchOperation;

  @ApiProperty({ example: '/state', description: 'JSON pointer path to the field' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({ 
    description: 'Value for add/replace operations (can be string, number, object, array, etc.)',
    example: 'ACTIVE',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'object' },
      { type: 'array' },
    ],
  })
  @IsOptional()
  value?: any;

  @ApiPropertyOptional({ description: 'Source path for move/copy operations' })
  @IsOptional()
  @IsString()
  from?: string;
}

export class UpdateBillingPlanDto {
  @ApiProperty({ type: [PatchOperationDto], description: 'Array of patch operations' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchOperationDto)
  operations: PatchOperationDto[];
}
