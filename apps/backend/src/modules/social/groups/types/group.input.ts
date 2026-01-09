import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateGroupInput {
  @Field()
  nameEn: string;

  @Field({ nullable: true })
  nameAr?: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field(() => Int)
  privacyId: number;
}

@InputType()
export class UpdateGroupInput {
  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameAr?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field(() => Int, { nullable: true })
  privacyId?: number;
}
