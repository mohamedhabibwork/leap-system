import { z } from 'zod';
import { registerAs } from '@nestjs/config';

/**
 * Constants for default values
 */
const DEFAULTS = {
  NODE_ENV: 'development' as const,
  PORT: '3000',
  HOST: 'localhost',
  GRPC_HOST: '0.0.0.0',
  GRPC_PORT: '5000',
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: 'postgres',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_DB: 'leap_lms',
  JWT_SECRET: 'your-super-secret-jwt-key-change-this',
  JWT_EXPIRATION: '7d',
  JWT_REFRESH_EXPIRATION: '30d',
  COOKIE_SAME_SITE: 'lax' as const,
  SESSION_COOKIE_NAME: 'leap_session',
  BACKEND_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3001',
  TASK_ADS_FLUSH_INTERVAL: '30000',
  TASK_FCM_CLEANUP_CRON: '0 2 * * *',
  TASK_TEMP_FILE_CLEANUP_CRON: '0 */6 * * *',
  // OIDC Configuration
  OIDC_ISSUER: 'http://localhost:3000',
  OIDC_COOKIE_KEYS: '',
} as const;

/**
 * Environment variable schema with validation using Zod
 * Organized by feature/domain for better maintainability
 */
export const envSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default(DEFAULTS.NODE_ENV),
  PORT: z.string().default(DEFAULTS.PORT),
  HOST: z.string().default(DEFAULTS.HOST),

  // gRPC Configuration
  GRPC_URL: z.string().optional(),
  GRPC_HOST: z.string().default(DEFAULTS.GRPC_HOST),
  GRPC_PORT: z.string().default(DEFAULTS.GRPC_PORT),

  // Database Configuration
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_CONNECTION_STRING: z.string().optional(),
  POSTGRES_USER: z.string().default(DEFAULTS.POSTGRES_USER),
  POSTGRES_PASSWORD: z.string().default(DEFAULTS.POSTGRES_PASSWORD),
  POSTGRES_HOST: z.string().default(DEFAULTS.POSTGRES_HOST),
  POSTGRES_PORT: z.string().default(DEFAULTS.POSTGRES_PORT),
  POSTGRES_DB: z.string().default(DEFAULTS.POSTGRES_DB),
  TEST_DATABASE_URL: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().default(DEFAULTS.JWT_SECRET),
  JWT_EXPIRATION: z.string().default(DEFAULTS.JWT_EXPIRATION),
  JWT_REFRESH_EXPIRATION: z.string().default(DEFAULTS.JWT_REFRESH_EXPIRATION),

  // Session Configuration
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().default('true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default(DEFAULTS.COOKIE_SAME_SITE),
  SESSION_COOKIE_NAME: z.string().default(DEFAULTS.SESSION_COOKIE_NAME),
  SESSION_MAX_AGE: z.string().default('604800'), // 7 days
  SESSION_MAX_AGE_REMEMBER_ME: z.string().default('2592000'), // 30 days
  MAX_CONCURRENT_SESSIONS: z.string().default('5'),
  TOKEN_REFRESH_THRESHOLD: z.string().default('300'), // 5 minutes
  TOKEN_REFRESH_INTERVAL: z.string().default('60000'), // 1 minute
  SESSION_CLEANUP_INTERVAL: z.string().default('3600000'), // 1 hour

  // Application URLs
  BACKEND_URL: z.string().default(DEFAULTS.BACKEND_URL),
  FRONTEND_URL: z.string().default(DEFAULTS.FRONTEND_URL),
  ALLOWED_REDIRECT_URLS: z.string().optional(),


  // CORS Configuration
  CORS_ORIGIN: z.string().optional(),

  // Task Scheduling Configuration
  TASK_SESSION_CLEANUP_CRON: z.string().optional(),
  TASK_TOKEN_REFRESH_CRON: z.string().optional(),
  TASK_ADS_FLUSH_INTERVAL: z.string().default(DEFAULTS.TASK_ADS_FLUSH_INTERVAL),
  TASK_FCM_CLEANUP_CRON: z.string().default(DEFAULTS.TASK_FCM_CLEANUP_CRON),
  TASK_TEMP_FILE_CLEANUP_CRON: z.string().default(DEFAULTS.TASK_TEMP_FILE_CLEANUP_CRON),

  // OIDC Configuration
  OIDC_ISSUER: z.string().default(DEFAULTS.OIDC_ISSUER),
  OIDC_COOKIE_KEYS: z.string().default(DEFAULTS.OIDC_COOKIE_KEYS),
  OIDC_INITIAL_ACCESS_TOKEN: z.string().optional(),
  OIDC_JWKS: z.string().optional(),

  // PayPal Configuration
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
});

/**
 * Type inference from Zod schema
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Centralized error handling for validation failures
 */
function handleValidationError(error: z.ZodError): never {
  console.error('❌ Invalid environment variables:');
  error.errors.forEach((err) => {
    const path = err.path.join('.') || 'root';
    console.error(`  - ${path}: ${err.message}`);
  });
  throw new Error('Invalid environment variables. Please check your .env file.');
}

/**
 * Parse and validate environment variables
 * Centralized parsing logic to avoid duplication
 */
function parseEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    handleValidationError(parsed.error);
  }
  return parsed.data;
}

/**
 * Validation function for NestJS ConfigModule
 * Used in ConfigModule.forRoot({ validate: validateEnv })
 * 
 * This function validates the config object that NestJS loads from .env files
 * and returns the validated, typed configuration.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  // Validate the config object passed by NestJS (which includes .env file values)
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    handleValidationError(parsed.error);
  }
  return parsed.data;
}

/**
 * NestJS ConfigModule configuration using registerAs
 * Provides typed access via ConfigService.get<EnvConfig>('env')
 * 
 * @example
 * ```typescript
 * constructor(private configService: ConfigService) {}
 * 
 * // Typed access
 * const envConfig = this.configService.get<EnvConfig>('env');
 * const nodeEnv = envConfig.NODE_ENV;
 * 
 * // Direct path access
 * const port = this.configService.get<string>('env.PORT');
 * ```
 */
export default registerAs('env', (): EnvConfig => parseEnv());

/**
 * Cached environment configuration
 * Memoized to avoid repeated parsing
 * Used for static contexts (module decorators, utility functions)
 */
let cachedEnv: EnvConfig | null = null;

/**
 * Get validated environment configuration
 * For use in static contexts where ConfigService is not available
 * (e.g., module decorators, utility functions, bootstrap)
 * 
 * @returns Validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = parseEnv();
  }
  return cachedEnv;
}

/**
 * Environment helper functions
 * Accept optional config parameter for use with ConfigService
 */
export const isDevelopment = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnvConfig();
  return envConfig.NODE_ENV === 'development';
};

export const isProduction = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnvConfig();
  return envConfig.NODE_ENV === 'production';
};

export const isTest = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnvConfig();
  return envConfig.NODE_ENV === 'test';
};

/**
 * Utility functions for environment variable parsing
 */
export const getBooleanEnv = (value: string | undefined, defaultValue = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const getIntEnv = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const getArrayEnv = (value: string | undefined, defaultValue: string[] = []): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};
