import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getEnvConfig } from '../../config/env';
import * as schema from '@leap-lms/database';

/**
 * Get database connection string with fallback
 * Supports multiple fallback formats for different PostgreSQL setups
 */
export function getDatabaseConnectionString(): string {
  const env = getEnvConfig();
  
  // First try environment variable
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  // Try common environment variable names
  if (env.POSTGRES_URL) {
    return env.POSTGRES_URL;
  }

  if (env.POSTGRES_CONNECTION_STRING) {
    return env.POSTGRES_CONNECTION_STRING;
  }

  // Fallback to default local PostgreSQL connection
  // Format: postgresql://[user[:password]@][host][:port][/database]
  const user = env.POSTGRES_USER;
  const password = env.POSTGRES_PASSWORD;
  const host = env.POSTGRES_HOST;
  const port = env.POSTGRES_PORT;
  const database = env.POSTGRES_DB;

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Create a database pool with proper connection string
 */
export function createDatabasePool(): Pool {
  const connectionString = getDatabaseConnectionString();
  return new Pool({ connectionString });
}

export function createDrizzleDatabase(): { db: NodePgDatabase<typeof schema>; pool: Pool } {
  const pool = createDatabasePool();
  const db = drizzle(pool, { schema });
  return { db, pool };
}