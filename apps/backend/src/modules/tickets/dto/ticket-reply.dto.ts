import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketReplyDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsNotEmpty()
  @IsInt()
  ticketId: number;

  @ApiProperty({ description: 'Reply message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Is internal note (only visible to staff)', default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false;

  @ApiPropertyOptional({ description: 'Attachment URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class UpdateTicketReplyDto {
  @ApiPropertyOptional({ description: 'Reply message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Is internal note' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'Attachment URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
