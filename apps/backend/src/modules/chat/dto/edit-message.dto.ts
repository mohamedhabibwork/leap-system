import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
  @ApiProperty({ 
    description: 'Message ID to edit',
    example: 123
  })
  @IsNumber()
  @IsNotEmpty()
  messageId: number;

  @ApiProperty({ 
    description: 'New message content',
    example: 'Updated message content'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
