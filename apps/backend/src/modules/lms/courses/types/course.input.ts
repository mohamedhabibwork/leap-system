import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCourseInput {
  @Field()
  titleEn: string;

  @Field({ nullable: true })
  titleAr?: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field(() => Int)
  instructorId: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  enrollmentTypeId?: number;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int, { nullable: true })
  durationHours?: number;
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  titleEn?: string;

  @Field({ nullable: true })
  titleAr?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field(() => Int, { nullable: true })
  instructorId?: number;

  @Field(() => Int, { nullable: true })
  statusId?: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  enrollmentTypeId?: number;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int, { nullable: true })
  durationHours?: number;
}
