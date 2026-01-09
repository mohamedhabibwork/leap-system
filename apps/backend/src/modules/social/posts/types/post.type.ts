import { ObjectType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../../graphql/scalars/json.scalar';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  postTypeId: number;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Int)
  visibilityId: number;

  @Field(() => Int, { nullable: true })
  groupId?: number;

  @Field(() => Int, { nullable: true })
  pageId?: number;

  @Field(() => Int)
  shareCount: number;

  @Field(() => Int)
  commentCount: number;

  @Field(() => Int)
  reactionCount: number;

  @Field(() => Int)
  viewCount: number;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: any;

  @Field(() => JSONScalar, { nullable: true })
  settings?: any;

  @Field()
  isDeleted: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}
