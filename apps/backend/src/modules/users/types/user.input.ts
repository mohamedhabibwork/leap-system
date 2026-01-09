import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  timezone?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  preferredLanguage?: string;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class AssignRoleInput {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  roleId: number;

  @Field({ nullable: true })
  expiresAt?: Date;
}

@InputType()
export class GrantPermissionInput {
  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  permissionId: number;

  @Field({ nullable: true })
  isGranted?: boolean;
}
