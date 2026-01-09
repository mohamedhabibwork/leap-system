import { ObjectType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

@ObjectType()
export class LookupType {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: any;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
