import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteMessageDto {
  @ApiProperty({ 
    description: 'Message ID to delete',
    example: 123
  })
  @IsNumber()
  @IsNotEmpty()
  messageId: number;
}
