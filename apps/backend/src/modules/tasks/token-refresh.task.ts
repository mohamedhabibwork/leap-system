import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { TokenRefreshService } from '../auth/token-refresh.service';
import { getEnvConfig } from '../../config/env';

/**
 * Token Refresh Task
 * 
 * Periodically checks for sessions with expiring tokens and refreshes them.
 * Runs every minute by default, configurable via TASK_TOKEN_REFRESH_CRON environment variable.
 */
@Injectable()
export class TokenRefreshTask {
  private readonly logger = new Logger(TokenRefreshTask.name);

  constructor(
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check and refresh tokens for sessions near expiry
   * Default: Runs every minute
   * Configurable via TASK_TOKEN_REFRESH_CRON environment variable
   */
  @Cron(getEnvConfig().TASK_TOKEN_REFRESH_CRON || CronExpression.EVERY_MINUTE, {
    name: 'token-refresh',
    timeZone: 'UTC',
  })
  async handleTokenRefresh() {
    try {
      this.logger.debug('Starting token refresh check...');
      
      // Call the token refresh service method
      await this.tokenRefreshService.checkAndRefreshTokens();
      
      this.logger.debug('Token refresh check completed');
    } catch (error: any) {
      this.logger.error(`Token refresh task failed: ${error?.message || error}`, error?.stack);
    }
  }
}
