import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty({ 
    description: 'Number of messages to return',
    example: 50,
    required: false,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiProperty({ 
    description: 'Number of messages to skip (for pagination)',
    example: 0,
    required: false,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
