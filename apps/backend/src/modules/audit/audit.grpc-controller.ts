import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller()
export class AuditGrpcController {
  constructor(private readonly auditService: AuditService) {}

  @GrpcMethod('AuditService', 'FindAll')
  async findAll() {
    const logs = await this.auditService.findAll();
    return { logs };
  }

  @GrpcMethod('AuditService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.auditService.findOne(data.id);
  }

  @GrpcMethod('AuditService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const logs = await this.auditService.findByUser(data.userId);
    return { logs };
  }

  @GrpcMethod('AuditService', 'Create')
  async create(data: any) {
    return this.auditService.create(data);
  }
}
