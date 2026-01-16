import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Notification {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  uuid?: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  notificationTypeId: number;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  linkUrl?: string;

  @Field(() => Boolean)
  isRead: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  readAt?: Date;

  @Field(() => Boolean, { nullable: true })
  isDeleted?: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class NotificationStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  unread: number;

  @Field(() => Int)
  read: number;
}

@ObjectType()
export class NotificationType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class NotificationCategory {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [NotificationType])
  types: NotificationType[];
}

@ObjectType()
export class NotificationTypesResponse {
  @Field(() => [NotificationCategory])
  categories: NotificationCategory[];
}

@ObjectType()
export class NotificationPreferences {
  @Field(() => Boolean)
  emailEnabled: boolean;

  @Field(() => Boolean)
  pushEnabled: boolean;

  @Field(() => Boolean)
  websocketEnabled: boolean;

  @Field(() => Boolean)
  notifyOnPostLikes: boolean;

  @Field(() => Boolean)
  notifyOnComments: boolean;

  @Field(() => Boolean)
  notifyOnCommentReplies: boolean;

  @Field(() => Boolean)
  notifyOnShares: boolean;

  @Field(() => Boolean)
  notifyOnFriendRequests: boolean;

  @Field(() => Boolean)
  notifyOnFriendRequestAccepted: boolean;

  @Field(() => Boolean)
  notifyOnGroupJoins: boolean;

  @Field(() => Boolean)
  notifyOnPageFollows: boolean;

  @Field(() => Boolean)
  notifyOnMentions: boolean;

  @Field(() => Boolean)
  notifyOnEventInvitations: boolean;

  @Field(() => String, { nullable: true })
  categories?: string;
}

@ObjectType()
export class FCMDevice {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  deviceType?: string;

  @Field(() => String, { nullable: true })
  deviceInfo?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  lastUsedAt?: Date;
}
