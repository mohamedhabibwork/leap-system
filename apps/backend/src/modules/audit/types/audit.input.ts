import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateAuditInput {
  @Field(() => Int, { nullable: true })
  userId?: number;

  @Field()
  auditableType: string;

  @Field(() => Int)
  auditableId: number;

  @Field()
  action: string;

  @Field(() => String, { nullable: true })
  oldValues?: string;

  @Field(() => String, { nullable: true })
  newValues?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;
}
