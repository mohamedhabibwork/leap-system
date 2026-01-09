import { ObjectType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

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

  @Field(() => JSONScalar, { nullable: true })
  oldValues?: any;

  @Field(() => JSONScalar, { nullable: true })
  newValues?: any;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt: Date;
}
