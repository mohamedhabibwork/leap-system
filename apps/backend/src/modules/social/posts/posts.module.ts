import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsResolver } from './posts.resolver';
import { PostsGrpcController } from './posts.grpc-controller';
import { DatabaseModule } from '../../../database/database.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [PostsController, PostsGrpcController],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
