import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditLog } from './types/audit.type';
import { CreateAuditInput } from './types/audit.input';

@Resolver(() => AuditLog)

export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => [AuditLog], { name: 'auditLogs' })
  @Roles('admin')
  async findAll() {
    return this.auditService.findAll();
  }

  @Query(() => AuditLog, { name: 'auditLog' })
  @Roles('admin')
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.auditService.findOne(id);
  }

  @Query(() => [AuditLog], { name: 'auditLogsByUser' })
  @Roles('admin')
  async findByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.auditService.findByUser(userId);
  }

  @Mutation(() => AuditLog)
  async createAuditLog(@Args('input') input: CreateAuditInput) {
    return this.auditService.create({
      ...input,
      userId: input.userId || 0, // Provide default userId if not provided
    } as any);
  }
}
