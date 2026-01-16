/**
 * Centralized Configuration Module
 * 
 * This module provides a unified interface for accessing all application configuration.
 * All configs are validated, typed, and accessible via ConfigService throughout the backend.
 * 
 * @example
 * ```typescript
 * // In a NestJS service - Using AppConfigService (Recommended)
 * import { AppConfigService } from '../config/config.service';
 * 
 * constructor(private config: AppConfigService) {}
 * const port = this.config.getPort();
 * ```
 * 
 * @example
 * // In a NestJS service - Using ConfigService directly
 * import { ConfigService } from '@nestjs/config';
 * import type { EnvConfig } from '../config';
 * 
 * constructor(private configService: ConfigService) {}
 * const envConfig = this.configService.get<EnvConfig>('env');
 * ```
 * 
 * @example
 * // In static contexts (module decorators, utilities)
 * import { getAppConfig, getDatabaseConfig } from '../config';
 * 
 * const appConfig = getAppConfig();
 * ```
 */

// Core environment configuration
export {
  envSchema,
  validateEnv,
  getEnvConfig,
  isDevelopment,
  isProduction,
  isTest,
  getBooleanEnv,
  getIntEnv,
  getArrayEnv,
  type EnvConfig,
} from './env';

// Environment config registration (for ConfigModule)
export { default as envConfig } from './env';

// JWT Configuration
export { default as jwtConfig } from './jwt.config';


// Configuration Module and Service
export { ConfigModule } from './config.module';
export { AppConfigService } from './config.service';

// Type definitions
export type {
  AppConfig,
  DatabaseConfig,
  GrpcConfig,
  JwtConfig,
  TaskConfig,
} from './types';

/**
 * Type-safe config getters for static contexts
 * These can be used in module decorators, utilities, and bootstrap code
 */
export function getAppConfig() {
  const env = getEnvConfig();
  return {
    nodeEnv: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    backendUrl: env.BACKEND_URL,
    frontendUrl: env.FRONTEND_URL,
    corsOrigin: env.CORS_ORIGIN,
  };
}

export function getDatabaseConfig() {
  const env = getEnvConfig();
  return {
    databaseUrl: env.DATABASE_URL,
    postgresUrl: env.POSTGRES_URL,
    postgresConnectionString: env.POSTGRES_CONNECTION_STRING,
    postgresUser: env.POSTGRES_USER,
    postgresPassword: env.POSTGRES_PASSWORD,
    postgresHost: env.POSTGRES_HOST,
    postgresPort: parseInt(env.POSTGRES_PORT, 10),
    postgresDb: env.POSTGRES_DB,
    testDatabaseUrl: env.TEST_DATABASE_URL,
  };
}

export function getGrpcConfig() {
  const env = getEnvConfig();
  return {
    url: env.GRPC_URL,
    host: env.GRPC_HOST,
    port: parseInt(env.GRPC_PORT, 10),
  };
}

export function getTaskConfig() {
  const env = getEnvConfig();
  return {
    sessionCleanupCron: env.TASK_SESSION_CLEANUP_CRON,
    tokenRefreshCron: env.TASK_TOKEN_REFRESH_CRON,
    adsFlushInterval: getIntEnv(env.TASK_ADS_FLUSH_INTERVAL, 30000),
    fcmCleanupCron: env.TASK_FCM_CLEANUP_CRON,
    tempFileCleanupCron: env.TASK_TEMP_FILE_CLEANUP_CRON,
  };
}

// Import helper functions for use in exported functions
import { getEnvConfig, getIntEnv } from './env';
