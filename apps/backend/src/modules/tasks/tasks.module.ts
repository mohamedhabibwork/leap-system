import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionCleanupTask } from './session-cleanup.task';
import { TokenRefreshTask } from './token-refresh.task';
import { AdsTrackingFlushTask } from './ads-tracking-flush.task';
import { FCMTokenCleanupTask } from './fcm-token-cleanup.task';
import { TemporaryFileCleanupTask } from './temporary-file-cleanup.task';
import { AuthModule } from '../auth/auth.module';
import { AdsModule } from '../ads/ads.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    AdsModule,
    NotificationsModule,
    MediaModule,
  ],
  providers: [
    SessionCleanupTask,
    TokenRefreshTask,
    AdsTrackingFlushTask,
    FCMTokenCleanupTask,
    TemporaryFileCleanupTask,
  ],
})
export class TasksModule {}
