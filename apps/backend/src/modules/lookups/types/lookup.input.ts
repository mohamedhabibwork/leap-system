import { InputType, Field, Int } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

@InputType()
export class CreateLookupInput {
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

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateLookupInput {
  @Field(() => Int, { nullable: true })
  lookupTypeId?: number;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  nameEn?: string;

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

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class CreateLookupTypeInput {
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

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateLookupTypeInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: any;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}
