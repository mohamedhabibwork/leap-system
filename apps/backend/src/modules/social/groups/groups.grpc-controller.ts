import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GroupsService } from './groups.service';

@Controller()
export class GroupsGrpcController {
  constructor(private readonly groupsService: GroupsService) {}

  @GrpcMethod('GroupsService', 'FindAll')
  async findAll(data: { page?: number; limit?: number }) {
    const result = await this.groupsService.findAll(data.page || 1, data.limit || 10);
    return { groups: result.data };
  }

  @GrpcMethod('GroupsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.groupsService.findOne(data.id);
  }

  @GrpcMethod('GroupsService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const groups = await this.groupsService.findByUser(data.userId);
    return { groups };
  }

  @GrpcMethod('GroupsService', 'Create')
  async create(data: any) {
    return this.groupsService.create(data);
  }

  @GrpcMethod('GroupsService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.groupsService.update(id, updateData);
  }

  @GrpcMethod('GroupsService', 'Delete')
  async delete(data: { id: number }) {
    await this.groupsService.remove(data.id);
    return { message: 'Group deleted successfully' };
  }

  @GrpcMethod('GroupsService', 'JoinGroup')
  async joinGroup(data: { groupId: number; userId: number }) {
    await this.groupsService.joinGroup(data.groupId, data.userId);
    return { message: 'Successfully joined group' };
  }

  @GrpcMethod('GroupsService', 'LeaveGroup')
  async leaveGroup(data: { groupId: number; userId: number }) {
    await this.groupsService.leaveGroup(data.groupId, data.userId);
    return { message: 'Successfully left group' };
  }
}
