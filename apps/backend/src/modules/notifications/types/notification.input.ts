import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateNotificationInput {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  notificationTypeId: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  linkUrl?: string;
}

@InputType()
export class UpdateNotificationInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  linkUrl?: string;

  @Field(() => Boolean, { nullable: true })
  isRead?: boolean;
}

@InputType()
export class UpdateNotificationPreferencesInput {
  @Field(() => Boolean, { nullable: true })
  emailEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  pushEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  websocketEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnPostLikes?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnComments?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnCommentReplies?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnShares?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnFriendRequests?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnFriendRequestAccepted?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnGroupJoins?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnPageFollows?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnMentions?: boolean;

  @Field(() => Boolean, { nullable: true })
  notifyOnEventInvitations?: boolean;

  @Field(() => String, { nullable: true })
  categories?: string;
}

@InputType()
export class BulkDeleteNotificationsInput {
  @Field(() => [Int])
  notificationIds: number[];
}
