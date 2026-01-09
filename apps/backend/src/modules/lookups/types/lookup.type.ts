import { ObjectType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';
import { PaginationInfo } from '../../../graphql/types/pagination.type';

@ObjectType()
export class Lookup {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int)
  lookupTypeId: number;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field()
  code: string;

  @Field()
  nameEn: string;

  @Field({ nullable: true })
  nameAr?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: any;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field(() => Int, { nullable: true })
  displayOrder?: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class LookupsPaginated {
  @Field(() => [Lookup])
  data: Lookup[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
export class LookupStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  inactive: number;
}
