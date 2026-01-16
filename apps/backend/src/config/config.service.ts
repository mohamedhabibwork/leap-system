import { Injectable, Inject } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { EnvConfig } from './env';

/**
 * Enhanced Configuration Service
 * 
 * Provides type-safe, convenient access to all application configuration.
 * This service wraps NestJS ConfigService with additional helper methods
 * and type safety for better developer experience.
 * 
 * @example
 * ```typescript
 * constructor(private config: AppConfigService) {}
 * 
 * const nodeEnv = this.config.getNodeEnv();
 * const port = this.config.getPort();
 * const dbUrl = this.config.getDatabaseUrl();
 * ```
 */
@Injectable()
export class AppConfigService {
  constructor(
    @Inject(NestConfigService)
    private readonly configService: NestConfigService,
  ) {}

  /**
   * Get the full environment configuration
   */
  getEnv(): EnvConfig {
    return this.configService.get<EnvConfig>('env')!;
  }

  /**
   * Application Configuration
   */
  getNodeEnv(): 'development' | 'production' | 'test' {
    return this.getEnv().NODE_ENV;
  }

  getPort(): number {
    return parseInt(this.getEnv().PORT, 10);
  }

  getHost(): string {
    return this.getEnv().HOST;
  }

  getBackendUrl(): string {
    return this.getEnv().BACKEND_URL;
  }

  getFrontendUrl(): string {
    return this.getEnv().FRONTEND_URL;
  }

  getCorsOrigin(): string | undefined {
    return this.getEnv().CORS_ORIGIN;
  }

  /**
   * Database Configuration
   */
  getDatabaseUrl(): string | undefined {
    return this.getEnv().DATABASE_URL;
  }

  getPostgresConfig() {
    const env = this.getEnv();
    return {
      url: env.POSTGRES_URL,
      connectionString: env.POSTGRES_CONNECTION_STRING,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      host: env.POSTGRES_HOST,
      port: parseInt(env.POSTGRES_PORT, 10),
      database: env.POSTGRES_DB,
    };
  }

  /**
   * JWT Configuration
   */
  getJwtConfig() {
    return this.configService.get('jwt')!;
  }


  /**
   * gRPC Configuration
   */
  getGrpcConfig() {
    const env = this.getEnv();
    return {
      url: env.GRPC_URL,
      host: env.GRPC_HOST,
      port: parseInt(env.GRPC_PORT, 10),
    };
  }

  /**
   * Task Scheduling Configuration
   */
  getTaskConfig() {
    const env = this.getEnv();
    return {
      sessionCleanupCron: env.TASK_SESSION_CLEANUP_CRON,
      tokenRefreshCron: env.TASK_TOKEN_REFRESH_CRON,
      adsFlushInterval: parseInt(env.TASK_ADS_FLUSH_INTERVAL, 10),
      fcmCleanupCron: env.TASK_FCM_CLEANUP_CRON,
      tempFileCleanupCron: env.TASK_TEMP_FILE_CLEANUP_CRON,
    };
  }

  /**
   * Environment helpers
   */
  isDevelopment(): boolean {
    return this.getNodeEnv() === 'development';
  }

  isProduction(): boolean {
    return this.getNodeEnv() === 'production';
  }

  isTest(): boolean {
    return this.getNodeEnv() === 'test';
  }

  /**
   * Generic getter (delegates to NestJS ConfigService)
   */
  get<T = any>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }
}
