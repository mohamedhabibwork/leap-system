import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AuditLog {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

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

  @Field()
  createdAt: Date;
}
