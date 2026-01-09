import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Media {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

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

  @Field()
  isTemporary: boolean;

  @Field({ nullable: true })
  tempExpiresAt?: Date;

  @Field(() => Int)
  downloadCount: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
