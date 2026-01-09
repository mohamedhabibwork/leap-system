import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MediaService } from './media.service';

@Controller()
export class MediaGrpcController {
  constructor(private readonly mediaService: MediaService) {}

  @GrpcMethod('MediaService', 'FindAll')
  async findAll() {
    const media = await this.mediaService.findAll();
    return { media };
  }

  @GrpcMethod('MediaService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.mediaService.findOne(data.id);
  }

  @GrpcMethod('MediaService', 'FindByEntity')
  async findByEntity(data: { entityType: string; entityId: number }) {
    const media = await this.mediaService.findByUploadable(data.entityType, data.entityId);
    return { media };
  }

  @GrpcMethod('MediaService', 'Create')
  async create(data: any) {
    return this.mediaService.create(data);
  }

  @GrpcMethod('MediaService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.mediaService.update(id, updateData);
  }

  @GrpcMethod('MediaService', 'Delete')
  async delete(data: { id: number }) {
    await this.mediaService.remove(data.id);
    return { message: 'Media deleted successfully' };
  }
}
