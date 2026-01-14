import { IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendConnectionRequestDto {
  @ApiProperty({ description: 'ID of the user to connect with' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ description: 'Optional message with the connection request' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
