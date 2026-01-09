import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateAssignmentInput {
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

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  maxPoints?: number;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int, { nullable: true })
  maxAttempts?: number;

  @Field({ nullable: true, defaultValue: false })
  allowLateSubmission?: boolean;
}

@InputType()
export class UpdateAssignmentInput {
  @Field({ nullable: true })
  titleEn?: string;

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

  @Field(() => Int, { nullable: true })
  maxPoints?: number;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => Int, { nullable: true })
  maxAttempts?: number;

  @Field({ nullable: true })
  allowLateSubmission?: boolean;
}
