import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ 
    description: 'Chat room ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ 
    description: 'Message content',
    example: 'Hello, how are you?'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    description: 'URL to attachment (image, file, etc.)',
    example: 'https://example.com/file.pdf',
    required: false
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiProperty({ 
    description: 'ID of message being replied to',
    example: 123,
    required: false
  })
  @IsOptional()
  @IsNumber()
  replyToMessageId?: number;
}
