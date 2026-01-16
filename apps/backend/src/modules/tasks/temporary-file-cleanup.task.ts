import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MediaService } from '../media/media.service';
import { env } from '../../config/env';

/**
 * Temporary File Cleanup Task
 * 
 * Periodically cleans up temporary files older than 24 hours.
 * Runs every 6 hours by default, configurable via TASK_TEMP_FILE_CLEANUP_CRON environment variable.
 */
@Injectable()
export class TemporaryFileCleanupTask {
  private readonly logger = new Logger(TemporaryFileCleanupTask.name);

  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Clean up temporary files
   * Default: Runs every 6 hours
   * Configurable via TASK_TEMP_FILE_CLEANUP_CRON environment variable
   */
  @Cron(env.TASK_TEMP_FILE_CLEANUP_CRON || '0 */6 * * *', {
    name: 'temporary-file-cleanup',
    timeZone: 'UTC',
  })
  async handleTemporaryFileCleanup() {
    try {
      this.logger.log('Starting temporary file cleanup task...');
      
      const count = await this.mediaService.cleanupTemporaryFiles();
      
      if (count > 0) {
        this.logger.log(`Temporary file cleanup completed: removed ${count} temporary files`);
      } else {
        this.logger.debug('Temporary file cleanup completed: no temporary files found');
      }
    } catch (error: any) {
      this.logger.error(`Temporary file cleanup task failed: ${error?.message || error}`, error?.stack);
    }
  }
}
