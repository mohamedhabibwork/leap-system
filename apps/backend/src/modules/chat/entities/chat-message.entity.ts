import { ApiProperty } from '@nestjs/swagger';

export class ChatMessage {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  chatRoomId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ required: false })
  content?: string;

  @ApiProperty({ required: false })
  attachmentUrl?: string;

  @ApiProperty()
  messageTypeId: number;

  @ApiProperty({ required: false })
  replyToMessageId?: number;

  @ApiProperty()
  isEdited: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ required: false })
  editedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  // Relations (populated by service)
  user?: any;
  replyTo?: any;
}
