import { IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  websocketEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnPostLikes?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnComments?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnCommentReplies?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnShares?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnFriendRequests?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnFriendRequestAccepted?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnGroupJoins?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnPageFollows?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnMentions?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notifyOnEventInvitations?: boolean;

  @ApiProperty({ required: false, description: 'Category-specific channel preferences' })
  @IsObject()
  @IsOptional()
  categories?: {
    social?: { email: boolean; push: boolean; websocket: boolean };
    lms?: { email: boolean; push: boolean; websocket: boolean };
    jobs?: { email: boolean; push: boolean; websocket: boolean };
    events?: { email: boolean; push: boolean; websocket: boolean };
    payments?: { email: boolean; push: boolean; websocket: boolean };
    system?: { email: boolean; push: boolean; websocket: boolean };
  };
}
