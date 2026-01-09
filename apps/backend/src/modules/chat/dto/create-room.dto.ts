import { IsArray, IsNumber, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ 
    description: 'Array of user IDs to add as participants',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  participantIds: number[];

  @ApiProperty({ 
    description: 'Room name (optional, for group chats)',
    example: 'Project Discussion',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Chat type ID from lookups table',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  chatTypeId?: number;
}
