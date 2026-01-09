import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Enrollment {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  courseId: number;

  @Field(() => Int)
  enrollmentTypeId: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int, { nullable: true })
  subscriptionId?: number;

  @Field(() => Float, { nullable: true })
  amountPaid?: number;

  @Field()
  enrolledAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Float)
  progressPercentage: number;

  @Field({ nullable: true })
  lastAccessedAt?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
