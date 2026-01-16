import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { DatabaseModule } from '../../../database/database.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, NotificationsModule, AuthModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
