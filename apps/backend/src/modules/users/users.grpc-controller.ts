import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'FindAll')
  async findAll(data: { page?: number; limit?: number }) {
    const result = await this.usersService.findAll(data.page || 1, data.limit || 10);
    return { users: result.data, total: result.total };
  }

  @GrpcMethod('UsersService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.usersService.findOne(data.id);
  }

  @GrpcMethod('UsersService', 'FindByEmail')
  async findByEmail(data: { email: string }) {
    return this.usersService.findByEmail(data.email);
  }

  @GrpcMethod('UsersService', 'Create')
  async create(data: any) {
    return this.usersService.create(data);
  }

  @GrpcMethod('UsersService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.usersService.update(id, updateData);
  }

  @GrpcMethod('UsersService', 'UpdateProfile')
  async updateProfile(data: any) {
    const { userId, ...profileData } = data;
    return this.usersService.updateProfile(userId, profileData);
  }

  @GrpcMethod('UsersService', 'Delete')
  async delete(data: { id: number }) {
    await this.usersService.remove(data.id);
    return { message: 'User deleted successfully' };
  }

  @GrpcMethod('UsersService', 'BlockUser')
  async blockUser(data: { id: number; reason?: string }) {
    return this.usersService.blockUser(data.id, data.reason);
  }

  @GrpcMethod('UsersService', 'UnblockUser')
  async unblockUser(data: { id: number }) {
    return this.usersService.unblockUser(data.id);
  }

  @GrpcMethod('UsersService', 'ChangePassword')
  async changePassword(data: { userId: number; currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(data.userId, data.currentPassword, data.newPassword);
  }

  @GrpcMethod('UsersService', 'SearchUsers')
  async searchUsers(data: { query?: string; roleFilter?: string; page?: number; limit?: number }) {
    return this.usersService.searchUsers(data.query, data.roleFilter, data.page || 1, data.limit || 20);
  }
}
