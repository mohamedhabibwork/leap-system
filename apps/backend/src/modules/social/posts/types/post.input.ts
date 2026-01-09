import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
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

  @Field(() => String, { nullable: true })
  attachments?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  contentEn?: string;

  @Field({ nullable: true })
  contentAr?: string;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field({ nullable: true })
  isPinned?: boolean;

  @Field({ nullable: true })
  isLocked?: boolean;
}
