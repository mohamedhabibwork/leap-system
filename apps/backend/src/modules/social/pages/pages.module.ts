import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { AdminPagesController } from './admin-pages.controller';
import { DatabaseModule } from '../../../database/database.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [PagesController, AdminPagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
