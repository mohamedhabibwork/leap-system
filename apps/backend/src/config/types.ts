import type { EnvConfig } from './env';

/**
 * Type definitions for all configuration objects
 * These types are inferred from the actual config implementations
 * and can be used for type-safe access throughout the application
 */

/**
 * Application configuration type
 */
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  host: string;
  backendUrl: string;
  frontendUrl: string;
  corsOrigin?: string;
}

/**
 * Database configuration type
 */
export interface DatabaseConfig {
  databaseUrl?: string;
  postgresUrl?: string;
  postgresConnectionString?: string;
  postgresUser: string;
  postgresPassword: string;
  postgresHost: string;
  postgresPort: number;
  postgresDb: string;
  testDatabaseUrl?: string;
}

/**
 * gRPC configuration type
 */
export interface GrpcConfig {
  url?: string;
  host: string;
  port: number;
}

/**
 * JWT configuration type
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

/**
 * Task scheduling configuration type
 */
export interface TaskConfig {
  sessionCleanupCron?: string;
  tokenRefreshCron?: string;
  adsFlushInterval: number;
  fcmCleanupCron: string;
  tempFileCleanupCron: string;
}

/**
 * Re-export EnvConfig for convenience
 */
export type { EnvConfig };
