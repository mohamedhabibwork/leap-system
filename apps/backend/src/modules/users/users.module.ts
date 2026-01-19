import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { UsersGrpcController } from './users.grpc-controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { GrpcAuthInterceptor } from '../../grpc/interceptors/grpc-auth.interceptor';
import { ConnectionsModule } from '../social/connections/connections.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, AuthModule, ConnectionsModule, NotificationsModule],
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersResolver, GrpcAuthInterceptor],
  exports: [UsersService],
})
export class UsersModule {}
