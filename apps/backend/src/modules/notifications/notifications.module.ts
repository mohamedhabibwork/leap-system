import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { AdminNotificationsService } from './admin-notifications.service';
import { FCMService } from './fcm.service';
import { FCMTokensService } from './fcm-tokens.service';
import { EmailService } from './email.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    AdminNotificationsService,
    FCMService,
    FCMTokensService,
    EmailService,
  ],
  exports: [
    NotificationsService,
    NotificationsGateway,
    AdminNotificationsService,
    FCMService,
    FCMTokensService,
    EmailService,
  ],
})
export class NotificationsModule {}
