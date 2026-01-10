import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendFriendRequestDto {
  @ApiProperty({ description: 'ID of the user to send friend request to' })
  @IsInt()
  @IsPositive()
  friendId: number;
}
