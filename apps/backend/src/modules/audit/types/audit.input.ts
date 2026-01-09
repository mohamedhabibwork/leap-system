import { InputType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

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
}
