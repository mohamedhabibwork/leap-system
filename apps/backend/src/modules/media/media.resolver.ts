import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { Media } from './types/media.type';
import { CreateMediaInput, UpdateMediaInput } from './types/media.input';

@Resolver(() => Media)
@UseGuards(JwtAuthGuard)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Query(() => [Media], { name: 'mediaFiles' })
  async findAll() {
    return this.mediaService.findAll();
  }

  @Query(() => Media, { name: 'mediaFile' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.mediaService.findOne(id);
  }

  @Query(() => [Media], { name: 'mediaByEntity' })
  async findByUploadable(
    @Args('entityType') entityType: string,
    @Args('entityId', { type: () => Int }) entityId: number,
  ) {
    return this.mediaService.findByUploadable(entityType, entityId);
  }

  @Mutation(() => Media)
  async createMedia(@Args('input') input: CreateMediaInput) {
    return this.mediaService.create({
      ...input,
      fileType: input.fileType || input.mimeType || 'application/octet-stream',
      mimeType: input.mimeType || input.fileType || 'application/octet-stream',
      fileSize: input.fileSize || 0,
    } as any);
  }

  @Mutation(() => Media)
  async updateMedia(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateMediaInput,
  ) {
    return this.mediaService.update(id, input);
  }

  @Mutation(() => String)
  async removeMedia(@Args('id', { type: () => Int }) id: number) {
    await this.mediaService.remove(id);
    return 'Media removed successfully';
  }
}
