import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../auth/session.service';
import { getEnvConfig } from '../../config/env';

/**
 * Session Cleanup Task
 * 
 * Periodically cleans up expired sessions from the database.
 * Runs hourly by default, configurable via TASK_SESSION_CLEANUP_CRON environment variable.
 */
@Injectable()
export class SessionCleanupTask {
  private readonly logger = new Logger(SessionCleanupTask.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Clean up expired sessions
   * Default: Runs every hour at minute 0
   * Configurable via TASK_SESSION_CLEANUP_CRON environment variable
   */
  @Cron(getEnvConfig().TASK_SESSION_CLEANUP_CRON || CronExpression.EVERY_HOUR, {
    name: 'session-cleanup',
    timeZone: 'UTC',
  })
  async handleSessionCleanup() {
    try {
      this.logger.debug('Starting session cleanup task...');
      
      const count = await this.sessionService.cleanupExpiredSessions();
      
      if (count > 0) {
        this.logger.log(`Session cleanup completed: removed ${count} expired sessions`);
      } else {
        this.logger.debug('Session cleanup completed: no expired sessions found');
      }
    } catch (error: any) {
      this.logger.error(`Session cleanup task failed: ${error?.message || error}`, error?.stack);
    }
  }
}
