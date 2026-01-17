import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PostsService } from './posts.service';
import { Post } from './types/post.type';
import { CreatePostInput, UpdatePostInput } from './types/post.input';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Resolver(() => Post)

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
  async findMyPosts(@CurrentUser() user: AuthenticatedUser) {
    return this.postsService.findByUser(getUserId(user));
  }

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.create({
      ...input,
      userId: getUserId(user),
      content: input.contentEn || input.contentAr || '',
      post_type: input.statusId || '',
      visibility: input.statusId || '',
    } as CreatePostDto & { userId: number });
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePostInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.update(id, {
      content: input.contentEn || input.contentAr || '',
      post_type: input.statusId || '',
      visibility: input.statusId || '',
      userId: getUserId(user),
    } as UpdatePostDto);
  }

  @Mutation(() => String)
  async removePost(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: AuthenticatedUser) {
    await this.postsService.remove(id, getUserId(user));
    return 'Post deleted successfully';
  }
}
