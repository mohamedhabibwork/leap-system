import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PostsService } from './posts.service';

@Controller()
export class PostsGrpcController {
  constructor(private readonly postsService: PostsService) {}

  @GrpcMethod('PostsService', 'FindAll')
  async findAll(data: { page?: number; limit?: number }) {
    const result = await this.postsService.findAll(data.page || 1, data.limit || 10);
    return { posts: result.data };
  }

  @GrpcMethod('PostsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.postsService.findOne(data.id);
  }

  @GrpcMethod('PostsService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const posts = await this.postsService.findByUser(data.userId);
    return { posts };
  }

  @GrpcMethod('PostsService', 'Create')
  async create(data: any) {
    return this.postsService.create(data);
  }

  @GrpcMethod('PostsService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.postsService.update(id, updateData);
  }

  @GrpcMethod('PostsService', 'Delete')
  async delete(data: { id: number }) {
    await this.postsService.remove(data.id);
    return { message: 'Post deleted successfully' };
  }
}
