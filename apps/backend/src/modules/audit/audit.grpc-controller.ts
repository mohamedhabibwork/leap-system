import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { GrpcAuthInterceptor } from '../../grpc/interceptors/grpc-auth.interceptor';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@Controller()
@UseInterceptors(GrpcAuthInterceptor)
export class AuditGrpcController {
  constructor(private readonly auditService: AuditService) {}

  @GrpcMethod('AuditService', 'FindAll')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll() {
    const logs = await this.auditService.findAll();
    return { logs };
  }

  @GrpcMethod('AuditService', 'FindOne')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findOne(data: { id: number }) {
    return this.auditService.findOne(data.id);
  }

  @GrpcMethod('AuditService', 'FindByUser')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findByUser(data: { userId: number }) {
    const logs = await this.auditService.findByUser(data.userId);
    return { logs };
  }

  @GrpcMethod('AuditService', 'Create')
  async create(data: any) {
    return this.auditService.create(data);
  }

  // Admin-specific RPCs
  @GrpcMethod('AuditService', 'FindAllPaginated')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAllPaginated(data: { page?: number; limit?: number; action?: string; auditableType?: string }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const logs = await this.auditService.findAll();
    
    // Filter logs if filters provided
    let filteredLogs = logs;
    if (data.action) {
      filteredLogs = filteredLogs.filter((log: { action: string }) => log.action === data.action);
    }
    if (data.auditableType) {
      filteredLogs = filteredLogs.filter((log: { auditableType: string }) => log.auditableType === data.auditableType);
    }
    
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
    
    return {
      logs: paginatedLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  @GrpcMethod('AuditService', 'FindByDateRange')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findByDateRange(data: { startDate: string; endDate: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const logs = await this.auditService.findAll();
    
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    const filteredLogs = logs.filter((log: { createdAt: string | Date }) => {
      const logDate = new Date(log.createdAt);
      return logDate >= startDate && logDate <= endDate;
    });
    
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
    
    return {
      logs: paginatedLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
