import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { FCMTokensService } from '../notifications/fcm-tokens.service';
import { getEnvConfig } from '../../config/env';

/**
 * FCM Token Cleanup Task
 * 
 * Periodically cleans up stale FCM tokens (not used in last 30 days).
 * Runs daily at 2 AM UTC by default, configurable via TASK_FCM_CLEANUP_CRON environment variable.
 */
@Injectable()
export class FCMTokenCleanupTask {
  private readonly logger = new Logger(FCMTokenCleanupTask.name);

  constructor(
    private readonly fcmTokensService: FCMTokensService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Clean up stale FCM tokens
   * Default: Runs daily at 2 AM UTC
   * Configurable via TASK_FCM_CLEANUP_CRON environment variable
   */
  @Cron(getEnvConfig().TASK_FCM_CLEANUP_CRON || '0 2 * * *', {
    name: 'fcm-token-cleanup',
    timeZone: 'UTC',
  })
  async handleFCMTokenCleanup() {
    try {
      this.logger.log('Starting FCM token cleanup task...');
      
      const count = await this.fcmTokensService.cleanupStaleTokens();
      
      if (count > 0) {
        this.logger.log(`FCM token cleanup completed: removed ${count} stale tokens`);
      } else {
        this.logger.debug('FCM token cleanup completed: no stale tokens found');
      }
    } catch (error: any) {
      this.logger.error(`FCM token cleanup task failed: ${error?.message || error}`, error?.stack);
    }
  }
}
