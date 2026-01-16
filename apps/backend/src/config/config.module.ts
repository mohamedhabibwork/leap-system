import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppConfigService } from './config.service';
import { validateEnv } from './env';
import envConfig from './env';
import jwtConfig from './jwt.config';

/**
 * Get the backend root directory
 * This ensures .env files are loaded from the correct location
 */
function getBackendRoot(): string {
  // When running from project root, go to apps/backend
  // When running from apps/backend, use current directory
  const backendPath = join(process.cwd(), 'apps', 'backend');
  if (existsSync(join(backendPath, 'package.json'))) {
    // Running from project root
    return backendPath;
  }
  // Running from apps/backend directory
  return process.cwd();
}

/**
 * Get all possible .env file paths
 * Checks both backend directory and current working directory
 */
function getEnvFilePaths(): string[] {
  const backendRoot = getBackendRoot();
  const paths = [
    join(backendRoot, '.env.local'),
    join(backendRoot, '.env'),
  ];
  
  // Also add current directory paths as fallback
  if (backendRoot !== process.cwd()) {
    paths.push('.env.local', '.env');
  }
  
  // Log which .env files will be checked (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const existingPaths = paths.filter(p => existsSync(p));
    if (existingPaths.length > 0) {
      console.log('📄 Loading .env files from:');
      existingPaths.forEach(p => console.log(`   ✓ ${p}`));
    } else {
      console.warn('⚠️  No .env files found. Using environment variables and defaults.');
    }
  }
  
  return paths;
}

/**
 * Global Configuration Module
 * 
 * This module provides centralized configuration management for the entire backend.
 * It's marked as @Global() so it can be imported once in AppModule and used everywhere.
 * 
 * The module automatically loads .env files from:
 * 1. apps/backend/.env.local (if running from project root)
 * 2. apps/backend/.env (if running from project root)
 * 3. .env.local (if running from apps/backend)
 * 4. .env (if running from apps/backend)
 * 
 * @example
 * ```typescript
 * // In app.module.ts
 * import { ConfigModule } from './config/config.module';
 * 
 * @Module({
 *   imports: [ConfigModule, ...],
 * })
 * ```
 * 
 * @example
 * ```typescript
 * // In any service
 * import { AppConfigService } from '../config/config.service';
 * 
 * constructor(private config: AppConfigService) {}
 * ```
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      // Load .env files from backend directory and current directory
      envFilePath: getEnvFilePaths(),
      // Expand variables in .env files (e.g., ${VAR})
      expandVariables: true,
      // Cache the loaded configuration
      cache: true,
      // Validate all environment variables at startup
      validate: validateEnv,
      // Load all registered configs
      load: [envConfig, jwtConfig],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, NestConfigModule],
})
export class ConfigModule {}
