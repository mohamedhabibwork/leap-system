import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { User, UsersPaginated } from './types/user.type';
import { CreateUserInput, UpdateUserInput, UpdateProfileInput } from './types/user.input';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UsersPaginated, { name: 'users' })
  @Roles('admin')
  async findAll(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: 'me' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.findOne(user.sub || user.id);
  }

  @Query(() => User, { name: 'userByEmail' })
  @Roles('admin')
  async findByEmail(@Args('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Query(() => UsersPaginated, { name: 'searchUsers' })
  async searchUsers(
    @Args('query', { nullable: true }) query: string,
    @Args('roleFilter', { nullable: true }) roleFilter: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ) {
    return this.usersService.searchUsers(query, roleFilter, page, limit);
  }

  @Query(() => User, { name: 'userProfile' })
  async getUserProfile(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.getUserProfile(id);
  }

  @Mutation(() => User)
  @Roles('admin')
  async createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create({
      ...input,
      firstName: input.firstName || '',
      lastName: input.lastName || '',
    } as any);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: any,
  ) {
    // Users can only update their own profile unless they're admin
    if (id !== currentUser.sub && !currentUser.roles?.includes('admin')) {
      throw new Error('Unauthorized');
    }
    return this.usersService.update(id, input);
  }

  @Mutation(() => User)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateProfile(user.sub || user.id, input);
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeUser(@Args('id', { type: () => Int }) id: number) {
    await this.usersService.remove(id);
    return 'User deleted successfully';
  }

  @Mutation(() => User)
  @Roles('admin')
  async blockUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    return this.usersService.blockUser(id, reason);
  }

  @Mutation(() => User)
  @Roles('admin')
  async unblockUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.unblockUser(id);
  }

  @Mutation(() => User)
  async uploadAvatar(
    @Args('avatarUrl') avatarUrl: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.uploadAvatar(user.sub || user.id, avatarUrl);
  }

  @Mutation(() => String)
  async changePassword(
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.changePassword(
      user.sub || user.id,
      currentPassword,
      newPassword,
    );
    return result.message;
  }
}
