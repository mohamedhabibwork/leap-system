import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateMediaInput {
  @Field(() => Int)
  uploadedBy: number;

  @Field({ nullable: true })
  mediableType?: string;

  @Field(() => Int, { nullable: true })
  mediableId?: number;

  @Field(() => Int)
  providerId: number;

  @Field()
  fileName: string;

  @Field()
  originalName: string;

  @Field()
  filePath: string;

  @Field({ nullable: true })
  fileType?: string;

  @Field({ nullable: true })
  mimeType?: string;

  @Field(() => Int, { nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  altText?: string;

  @Field(() => String, { nullable: true })
  metadata?: string;

  @Field({ nullable: true })
  isTemporary?: boolean;

  @Field({ nullable: true })
  tempExpiresAt?: Date;
}

@InputType()
export class UpdateMediaInput {
  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  altText?: string;

  @Field(() => String, { nullable: true })
  metadata?: string;

  @Field({ nullable: true })
  isTemporary?: boolean;
}
