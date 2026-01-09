import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PostsService } from './posts.service';
import { Post } from './types/post.type';
import { CreatePostInput, UpdatePostInput } from './types/post.input';

@Resolver(() => Post)
@UseGuards(JwtAuthGuard)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'posts' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.postsService.findAll(page, limit);
    return result.data;
  }

  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findOne(id);
  }

  @Query(() => [Post], { name: 'myPosts' })
  async findMyPosts(@CurrentUser() user: any) {
    return this.postsService.findByUser(user.sub || user.id);
  }

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput, @CurrentUser() user: any) {
    return this.postsService.create({
      ...input,
      userId: user.sub || user.id,
    } as any);
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePostInput,
  ) {
    return this.postsService.update(id, input as any);
  }

  @Mutation(() => String)
  async removePost(@Args('id', { type: () => Int }) id: number) {
    await this.postsService.remove(id);
    return 'Post deleted successfully';
  }
}
