import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Assignment {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int)
  sectionId: number;

  @Field()
  titleEn: string;

  @Field({ nullable: true })
  titleAr?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field({ nullable: true })
  instructionsEn?: string;

  @Field({ nullable: true })
  instructionsAr?: string;

  @Field(() => Int)
  maxPoints: number;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int, { nullable: true })
  maxAttempts?: number;

  @Field()
  allowLateSubmission: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
