import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditResolver } from './audit.resolver';
import { AuditGrpcController } from './audit.grpc-controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AuditController, AuditGrpcController],
  providers: [AuditService, AuditResolver],
  exports: [AuditService],
})
export class AuditModule {}
