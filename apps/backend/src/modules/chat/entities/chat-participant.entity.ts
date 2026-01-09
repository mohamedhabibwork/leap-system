import { ApiProperty } from '@nestjs/swagger';

export class ChatParticipant {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  chatRoomId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  isMuted: boolean;

  @ApiProperty({ required: false })
  joinedAt?: Date;

  @ApiProperty({ required: false })
  leftAt?: Date;

  @ApiProperty({ required: false })
  lastReadAt?: Date;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  // Relations (populated by service)
  user?: any;
  chatRoom?: any;
}
