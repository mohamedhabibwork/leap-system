import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Quiz {
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

  @Field(() => Int, { nullable: true })
  timeLimitMinutes?: number;

  @Field(() => Int, { nullable: true })
  maxAttempts?: number;

  @Field(() => Int)
  passingScore: number;

  @Field()
  shuffleQuestions: boolean;

  @Field()
  showCorrectAnswers: boolean;

  @Field({ nullable: true })
  availableFrom?: Date;

  @Field({ nullable: true })
  availableUntil?: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
