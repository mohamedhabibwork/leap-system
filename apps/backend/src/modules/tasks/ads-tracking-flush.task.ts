import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AdsTrackingService } from '../ads/ads-tracking.service';

/**
 * Ads Tracking Flush Task
 * 
 * Periodically flushes the impression queue to the database.
 * Runs every 30 seconds by default, configurable via TASK_ADS_FLUSH_INTERVAL environment variable.
 */
@Injectable()
export class AdsTrackingFlushTask {
  private readonly logger = new Logger(AdsTrackingFlushTask.name);

  constructor(
    private readonly adsTrackingService: AdsTrackingService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Flush impression queue to database
   * Default: Runs every 30 seconds (30000ms)
   * Configurable via TASK_ADS_FLUSH_INTERVAL environment variable (in milliseconds)
   */
  @Interval(parseInt(process.env.TASK_ADS_FLUSH_INTERVAL || '30000', 10))
  async handleAdsFlush() {
    try {
      this.logger.debug('Starting ads tracking flush...');
      
      // Call the flush method on the service
      await this.adsTrackingService.flushImpressionQueue();
      
      this.logger.debug('Ads tracking flush completed');
    } catch (error: any) {
      this.logger.error(`Ads tracking flush task failed: ${error?.message || error}`, error?.stack);
    }
  }
}
