import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field()
  username: string;

  @Field()
  email: string;

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

  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  statusId: number;

  @Field()
  preferredLanguage: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  emailVerifiedAt?: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field({ nullable: true })
  lastSeenAt?: Date;

  @Field()
  isOnline: boolean;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class UsersPaginated {
  @Field(() => [User])
  data: User[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class UserRole {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  roleId: number;

  @Field()
  assignedAt: Date;

  @Field(() => Int, { nullable: true })
  assignedBy?: number;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class RolePermission {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  roleId: number;

  @Field(() => Int)
  permissionId: number;

  @Field()
  isGranted: boolean;

  @Field()
  createdAt: Date;
}
