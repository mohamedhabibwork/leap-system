import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Group {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

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

  @Field(() => Int)
  createdBy: number;

  @Field(() => Int)
  membersCount: number;

  @Field(() => Int)
  postsCount: number;

  @Field()
  isOfficial: boolean;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
