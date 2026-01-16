import { z } from 'zod';
import { registerAs } from '@nestjs/config';

/**
 * Environment variable schema with validation using Zod
 * This schema is used to validate environment variables at application startup
 */
export const envSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('localhost'),

  // gRPC Configuration
  GRPC_URL: z.string().optional(),
  GRPC_HOST: z.string().default('0.0.0.0'),
  GRPC_PORT: z.string().default('5000'),

  // Database
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_CONNECTION_STRING: z.string().optional(),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().default('5432'),
  POSTGRES_DB: z.string().default('leap_lms'),
  TEST_DATABASE_URL: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().default('your-super-secret-jwt-key-change-this'),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),

  // Keycloak Configuration
  KEYCLOAK_URL: z.string().optional(),
  KEYCLOAK_SERVER_URL: z.string().optional(),
  KEYCLOAK_REALM: z.string().default('leap-realm'),
  KEYCLOAK_CLIENT_ID: z.string().default('leap-client'),
  KEYCLOAK_CLIENT_SECRET: z.string().default(''),
  KEYCLOAK_PUBLIC_KEY: z.string().default(''),
  KEYCLOAK_ISSUER: z.string().optional(),
  KEYCLOAK_WELL_KNOWN_URL: z.string().optional(),
  KEYCLOAK_AUTHORIZATION_ENDPOINT: z.string().optional(),
  KEYCLOAK_TOKEN_ENDPOINT: z.string().optional(),
  KEYCLOAK_USERINFO_ENDPOINT: z.string().optional(),
  KEYCLOAK_INTROSPECT_ENDPOINT: z.string().optional(),
  KEYCLOAK_LOGOUT_ENDPOINT: z.string().optional(),
  KEYCLOAK_JWKS_URI: z.string().optional(),

  // Keycloak Admin
  KEYCLOAK_ADMIN_URL: z.string().optional(),
  KEYCLOAK_ADMIN_REALM: z.string().default('master'),
  KEYCLOAK_ADMIN_CLIENT_ID: z.string().default('admin-cli'),
  KEYCLOAK_ADMIN_CLIENT_SECRET: z.string().default(''),
  KEYCLOAK_ADMIN_USERNAME: z.string().default('admin'),
  KEYCLOAK_ADMIN_PASSWORD: z.string().default('admin'),

  // Keycloak Sync
  KEYCLOAK_SYNC_ENABLED: z.string().default('false'),
  KEYCLOAK_SYNC_ON_CREATE: z.string().default('true'),
  KEYCLOAK_SYNC_ON_UPDATE: z.string().default('true'),

  // Keycloak SSO & Session
  KEYCLOAK_SSO_ENABLED: z.string().default('false'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().default('true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  SESSION_COOKIE_NAME: z.string().default('leap_session'),
  SESSION_MAX_AGE: z.string().default('604800'),
  SESSION_MAX_AGE_REMEMBER_ME: z.string().default('2592000'),
  MAX_CONCURRENT_SESSIONS: z.string().default('5'),
  TOKEN_REFRESH_THRESHOLD: z.string().default('300'),
  TOKEN_REFRESH_INTERVAL: z.string().default('60000'),
  SESSION_CLEANUP_INTERVAL: z.string().default('3600000'),

  // URLs & Redirects
  BACKEND_URL: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:3001'),
  ALLOWED_REDIRECT_URLS: z.string().optional(),

  // Keycloak OIDC
  KEYCLOAK_OIDC_ENABLED: z.string().default('true'),
  KEYCLOAK_USE_KEYCLOAK_CONNECT: z.string().default('false'),
  KEYCLOAK_OIDC_PKCE: z.string().default('false'),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // Task Scheduling
  TASK_SESSION_CLEANUP_CRON: z.string().optional(),
  TASK_TOKEN_REFRESH_CRON: z.string().optional(),
  TASK_ADS_FLUSH_INTERVAL: z.string().default('30000'),
  TASK_FCM_CLEANUP_CRON: z.string().default('0 2 * * *'),
  TASK_TEMP_FILE_CLEANUP_CRON: z.string().default('0 */6 * * *'),
});

/**
 * Type inference from Zod schema
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validation function for NestJS ConfigModule
 * This is used in ConfigModule.forRoot({ validate: validateEnv })
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.errors.forEach((error) => {
      const path = error.path.join('.');
      console.error(`  - ${path}: ${error.message}`);
    });
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/**
 * NestJS ConfigModule configuration using registerAs
 * This provides typed access via ConfigService.get<EnvConfig>('env')
 * 
 * Usage:
 * ```typescript
 * constructor(private configService: ConfigService) {}
 * 
 * const nodeEnv = this.configService.get<EnvConfig>('env').NODE_ENV;
 * // or
 * const nodeEnv = this.configService.get('env.NODE_ENV');
 * ```
 */
export default registerAs('env', (): EnvConfig => {
  // Parse and validate environment variables
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.errors.forEach((error) => {
      const path = error.path.join('.');
      console.error(`  - ${path}: ${error.message}`);
    });
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
});

/**
 * Direct access to validated environment variables
 * For backward compatibility and use outside of NestJS DI context
 * 
 * @deprecated Prefer using ConfigService in NestJS services
 * This export is kept for backward compatibility and non-DI contexts
 */
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('❌ Invalid environment variables:');
      parsed.error.errors.forEach((error) => {
        const path = error.path.join('.');
        console.error(`  - ${path}: ${error.message}`);
      });
      throw new Error('Invalid environment variables');
    }
    cachedEnv = parsed.data;
  }
  return cachedEnv;
}

/**
 * Direct access to validated environment variables (backward compatibility)
 * @deprecated Use getEnv() or ConfigService instead
 */
export const env = getEnv();

/**
 * Helper functions for common environment checks
 */
export const isDevelopment = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnv();
  return envConfig.NODE_ENV === 'development';
};

export const isProduction = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnv();
  return envConfig.NODE_ENV === 'production';
};

export const isTest = (config?: EnvConfig): boolean => {
  const envConfig = config || getEnv();
  return envConfig.NODE_ENV === 'test';
};

/**
 * Helper to get boolean from string env var
 */
export const getBooleanEnv = (value: string | undefined, defaultValue = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Helper to get integer from string env var
 */
export const getIntEnv = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Helper to parse comma-separated string array
 */
export const getArrayEnv = (value: string | undefined, defaultValue: string[] = []): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};
