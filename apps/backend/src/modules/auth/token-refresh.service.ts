import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';

/**
 * TokenRefreshService
 * 
 * Service that provides methods for checking and refreshing tokens.
 * Scheduled tasks are now handled by the TasksModule using @nestjs/schedule.
 */
@Injectable()
export class TokenRefreshService {
  private readonly logger = new Logger(TokenRefreshService.name);

  constructor(
    private sessionService: SessionService,
    private configService: ConfigService,
  ) {}

  /**
   * Check all active sessions and refresh tokens that are near expiry
   * This is called periodically by the scheduled task
   */
  async checkAndRefreshTokens(): Promise<void> {
    try {
      // Note: In production, you'd want to query sessions that need refresh
      // directly from the database rather than checking all sessions.
      // For now, this is a simplified implementation.
      
      this.logger.debug('Checking sessions for token refresh...');
      
      // This would typically query sessions where accessTokenExpiresAt is near current time
      // For now, we'll skip the full implementation as it would require database queries
      // The SessionService.refreshSession() method handles individual refreshes when needed
      
      // In a production system, you'd do something like:
      // const sessionsNeedingRefresh = await this.getSes sionsNeedingRefresh();
      // for (const session of sessionsNeedingRefresh) {
      //   await this.sessionService.refreshSession(session.sessionToken);
      // }
      
    } catch (error) {
      this.logger.error(`Error in token refresh job: ${error.message}`, error.stack);
    }
  }


  /**
   * Manually trigger token refresh for a specific session
   * Useful for testing or manual interventions
   */
  async manualRefresh(sessionToken: string): Promise<void> {
    try {
      await this.sessionService.refreshSession(sessionToken);
      this.logger.log(`Manual token refresh completed for session ${sessionToken.substring(0, 8)}...`);
    } catch (error) {
      this.logger.error(`Manual token refresh failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manually trigger cleanup
   * Useful for testing or manual interventions
   */
  async manualCleanup(): Promise<number> {
    try {
      const count = await this.sessionService.cleanupExpiredSessions();
      this.logger.log(`Manual cleanup completed, removed ${count} sessions`);
      return count;
    } catch (error) {
      this.logger.error(`Manual cleanup failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get service status
   * Note: Background jobs are now managed by scheduled tasks
   */
  getStatus(): {
    message: string;
  } {
    return {
      message: 'Token refresh is managed by scheduled tasks',
    };
  }
}
