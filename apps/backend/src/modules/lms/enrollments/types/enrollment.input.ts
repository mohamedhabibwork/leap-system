import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateEnrollmentInput {
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

  @Field({ nullable: true })
  expiresAt?: Date;
}

@InputType()
export class UpdateEnrollmentInput {
  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Float, { nullable: true })
  progressPercentage?: number;

  @Field({ nullable: true })
  completedAt?: Date;
}
