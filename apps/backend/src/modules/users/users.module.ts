import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { UsersGrpcController } from './users.grpc-controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
