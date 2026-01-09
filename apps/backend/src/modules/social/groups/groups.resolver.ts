import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { GroupsService } from './groups.service';
import { Group } from './types/group.type';
import { CreateGroupInput, UpdateGroupInput } from './types/group.input';

@Resolver(() => Group)
@UseGuards(JwtAuthGuard)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @Query(() => [Group], { name: 'groups' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.groupsService.findAll(page, limit);
    return result.data;
  }

  @Query(() => Group, { name: 'group' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.groupsService.findOne(id);
  }

  @Query(() => [Group], { name: 'myGroups' })
  async findMyGroups(@CurrentUser() user: any) {
    return this.groupsService.findByUser(user.sub || user.id);
  }

  @Mutation(() => Group)
  async createGroup(@Args('input') input: CreateGroupInput, @CurrentUser() user: any) {
    return this.groupsService.create({
      ...input,
      createdBy: user.sub || user.id,
    } as any);
  }

  @Mutation(() => Group)
  async updateGroup(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateGroupInput,
  ) {
    return this.groupsService.update(id, input as any);
  }

  @Mutation(() => String)
  async removeGroup(@Args('id', { type: () => Int }) id: number) {
    await this.groupsService.remove(id);
    return 'Group deleted successfully';
  }

  @Mutation(() => String)
  async joinGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() user: any,
  ) {
    await this.groupsService.joinGroup(groupId, user.sub || user.id);
    return 'Successfully joined group';
  }

  @Mutation(() => String)
  async leaveGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() user: any,
  ) {
    await this.groupsService.leaveGroup(groupId, user.sub || user.id);
    return 'Successfully left group';
  }
}
