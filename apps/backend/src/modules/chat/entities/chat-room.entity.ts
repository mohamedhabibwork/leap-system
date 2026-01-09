import { ApiProperty } from '@nestjs/swagger';

export class ChatRoom {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty()
  chatTypeId: number;

  @ApiProperty({ required: false })
  roomableType?: string;

  @ApiProperty({ required: false })
  roomableId?: number;

  @ApiProperty()
  createdBy: number;

  @ApiProperty({ required: false })
  lastMessageAt?: Date;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  // Relations (populated by service)
  participants?: any[];
  messages?: any[];
  lastMessage?: any;
  unreadCount?: number;
}
