import { ObjectType, Field, Int } from '@nestjs/graphql';

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

  @Field(() => String, { nullable: true })
  metadata?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
