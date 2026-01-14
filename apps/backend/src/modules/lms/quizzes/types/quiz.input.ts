import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateQuizInput {
  @Field(() => Int)
  sectionId: number;

  @Field(() => Int, { nullable: true })
  lessonId?: number;

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

  @Field(() => Int, { nullable: true, defaultValue: 60 })
  passingScore?: number;

  @Field({ nullable: true, defaultValue: false })
  shuffleQuestions?: boolean;

  @Field({ nullable: true, defaultValue: true })
  showCorrectAnswers?: boolean;

  @Field({ nullable: true })
  availableFrom?: Date;

  @Field({ nullable: true })
  availableUntil?: Date;
}

@InputType()
export class UpdateQuizInput {
  @Field(() => Int, { nullable: true })
  lessonId?: number;

  @Field({ nullable: true })
  titleEn?: string;

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

  @Field(() => Int, { nullable: true })
  passingScore?: number;

  @Field({ nullable: true })
  shuffleQuestions?: boolean;

  @Field({ nullable: true })
  showCorrectAnswers?: boolean;

  @Field({ nullable: true })
  availableFrom?: Date;

  @Field({ nullable: true })
  availableUntil?: Date;
}
