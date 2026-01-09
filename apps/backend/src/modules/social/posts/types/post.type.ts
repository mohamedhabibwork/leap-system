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

  @Field(() => Int, { nullable: true })
  postableId?: number;

  @Field({ nullable: true })
  postableType?: string;

  @Field(() => Int)
  statusId: number;

  @Field({ nullable: true })
  contentEn?: string;

  @Field({ nullable: true })
  contentAr?: string;

  @Field(() => JSONScalar, { nullable: true })
  attachments?: any;

  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  commentsCount: number;

  @Field(() => Int)
  sharesCount: number;

  @Field(() => Int)
  viewCount: number;

  @Field()
  isPinned: boolean;

  @Field()
  isLocked: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
