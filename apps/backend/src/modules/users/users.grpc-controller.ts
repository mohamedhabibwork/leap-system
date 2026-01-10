import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GrpcAuthInterceptor } from '../../grpc/interceptors/grpc-auth.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

/**
 * Users gRPC Controller with Authentication
 * All methods require authentication via metadata
 */
@Controller()
@UseInterceptors(GrpcAuthInterceptor)
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'FindAll')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.SUPER_ADMIN)
  async findAll(data: { page?: number; limit?: number }) {
    const result = await this.usersService.findAll(data.page || 1, data.limit || 10);
    return { users: result.data, total: result.total };
  }

  @GrpcMethod('UsersService', 'FindOne')
  async findOne(data: { id: number }) {
    // Public read access
    return this.usersService.findOne(data.id);
  }

  @GrpcMethod('UsersService', 'FindByEmail')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findByEmail(data: { email: string }) {
    // Admin only - sensitive operation
    return this.usersService.findByEmail(data.email);
  }

  @GrpcMethod('UsersService', 'Create')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(data: any) {
    // Admin only
    return this.usersService.create(data);
  }

  @GrpcMethod('UsersService', 'Update')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(data: any) {
    // Admin only - ownership should be checked in service
    const { id, ...updateData } = data;
    return this.usersService.update(id, updateData);
  }

  @GrpcMethod('UsersService', 'UpdateProfile')
  async updateProfile(data: any) {
    // Ownership verification should be done in service
    const { userId, ...profileData } = data;
    return this.usersService.updateProfile(userId, profileData);
  }

  @GrpcMethod('UsersService', 'Delete')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async delete(data: { id: number }) {
    // Admin only
    await this.usersService.remove(data.id);
    return { message: 'User deleted successfully' };
  }

  @GrpcMethod('UsersService', 'BlockUser')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async blockUser(data: { id: number; reason?: string }) {
    // Admin only
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
