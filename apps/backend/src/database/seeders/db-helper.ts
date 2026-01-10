import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

/**
 * Get database connection string with fallback
 * Supports multiple fallback formats for different PostgreSQL setups
 */
export function getDatabaseConnectionString(): string {
  // First try environment variable
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Try common environment variable names
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }

  if (process.env.POSTGRES_CONNECTION_STRING) {
    return process.env.POSTGRES_CONNECTION_STRING;
  }

  // Fallback to default local PostgreSQL connection
  // Format: postgresql://[user[:password]@][host][:port][/database]
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DB || 'leap_lms';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Create a database pool with proper connection string
 */
export function createDatabasePool(): Pool {
  const connectionString = getDatabaseConnectionString();
  return new Pool({ connectionString });
}

export function createDrizzleDatabase() {
  const connectionString = getDatabaseConnectionString();
  return drizzle(connectionString);
}