import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@leap-lms/database';
import { users, lookups, lookupTypes } from '@leap-lms/database';
import { eq, sql } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

export const DRIZZLE_DB = 'DRIZZLE_DB';

/**
 * Get database connection string for tests
 */
export function getTestDatabaseUrl(): string {
  return (
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:@localhost:5432/leap_lms_test'
  );
}

/**
 * Create a test database connection
 */
export function createTestDatabase() {
  const connectionString = getTestDatabaseUrl();
  const queryClient = postgres(connectionString);
  return drizzle(queryClient, { schema });
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(db: ReturnType<typeof createTestDatabase>): Promise<boolean> {
  try {
    // Simple query to test connection using sql template
    const result = await db.execute(sql`SELECT 1 as test`);
    return result.length > 0;
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || 'Unknown database error';
    const errorCode = error?.code || 'UNKNOWN';
    console.error('Database connection test failed:', errorMsg);
    console.error('Error code:', errorCode);
    if (error?.cause) {
      console.error('Error cause:', error.cause);
    }
    // Check for common connection errors and provide helpful messages
    if (errorCode === 'ECONNREFUSED' || errorMsg.includes('ECONNREFUSED')) {
      console.error('\n❌ Connection refused - PostgreSQL server may not be running');
      console.error('   To fix:');
      console.error('   1. Start PostgreSQL service');
      console.error('   2. Or set TEST_DATABASE_URL to point to a running PostgreSQL instance');
      console.error(`   3. Current connection string: ${getTestDatabaseUrl().replace(/:[^:@]+@/, ':****@')}\n`);
    } else if (errorCode === 'ENOTFOUND' || errorMsg.includes('ENOTFOUND')) {
      console.error('\n❌ Host not found - check DATABASE_URL host');
      console.error(`   Current connection string: ${getTestDatabaseUrl().replace(/:[^:@]+@/, ':****@')}\n`);
    } else if (errorCode === '28P01' || errorMsg.includes('password authentication')) {
      console.error('\n❌ Authentication failed - check database credentials');
      console.error(`   Current connection string: ${getTestDatabaseUrl().replace(/:[^:@]+@/, ':****@')}\n`);
    } else if (errorMsg.includes('database') && errorMsg.includes('does not exist')) {
      console.error('\n❌ Database does not exist - create the test database first');
      console.error('   To fix: CREATE DATABASE leap_lms_test;');
      console.error(`   Current connection string: ${getTestDatabaseUrl().replace(/:[^:@]+@/, ':****@')}\n`);
    }
    return false;
  }
}

/**
 * Get or create lookup type by code
 */
export async function getOrCreateLookupType(
  db: ReturnType<typeof createTestDatabase>,
  code: string,
  name: string,
) {
  const existing = await db
    .select()
    .from(lookupTypes)
    .where(eq(lookupTypes.code, code))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newType] = await db
    .insert(lookupTypes)
    .values({
      code,
      name,
    })
    .returning();

  return newType;
}

/**
 * Get or create lookup by type code and lookup code
 */
export async function getOrCreateLookup(
  db: ReturnType<typeof createTestDatabase>,
  lookupTypeCode: string,
  lookupCode: string,
  nameEn: string,
  nameAr?: string,
) {
  const lookupType = await getOrCreateLookupType(db, lookupTypeCode, lookupTypeCode);
  
  const existing = await db
    .select()
    .from(lookups)
    .where(eq(lookups.code, lookupCode))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newLookup] = await db
    .insert(lookups)
    .values({
      lookupTypeId: lookupType.id,
      code: lookupCode,
      nameEn,
      nameAr: nameAr || nameEn,
    } as InferInsertModel<typeof lookups>)
    .returning();

  return newLookup;
}

/**
 * Seed basic lookup data needed for tests
 */
export async function seedBasicLookups(db: ReturnType<typeof createTestDatabase>) {
  // User roles
  await getOrCreateLookup(db, 'user_role', 'student', 'Student', 'طالب');
  await getOrCreateLookup(db, 'user_role', 'instructor', 'Instructor', 'مدرس');
  await getOrCreateLookup(db, 'user_role', 'admin', 'Admin', 'مدير');

  // User status
  await getOrCreateLookup(db, 'user_status', 'active', 'Active', 'نشط');
  await getOrCreateLookup(db, 'user_status', 'inactive', 'Inactive', 'غير نشط');

  // Course status
  await getOrCreateLookup(db, 'course_status', 'draft', 'Draft', 'مسودة');
  await getOrCreateLookup(db, 'course_status', 'published', 'Published', 'منشور');

  // Event status
  await getOrCreateLookup(db, 'event_status', 'upcoming', 'Upcoming', 'قادم');
  await getOrCreateLookup(db, 'event_status', 'ongoing', 'Ongoing', 'جاري');

  // Job status
  await getOrCreateLookup(db, 'job_status', 'open', 'Open', 'مفتوح');
  await getOrCreateLookup(db, 'job_status', 'closed', 'Closed', 'مغلق');

  // Ticket status
  await getOrCreateLookup(db, 'ticket_status', 'open', 'Open', 'مفتوح');
  await getOrCreateLookup(db, 'ticket_status', 'resolved', 'Resolved', 'محلول');

  // Subscription status
  await getOrCreateLookup(db, 'subscription_status', 'active', 'Active', 'نشط');
  await getOrCreateLookup(db, 'subscription_status', 'cancelled', 'Cancelled', 'ملغي');

  // Notification types
  await getOrCreateLookup(db, 'notification_type', 'course_enrolled', 'Course Enrolled', 'تم التسجيل في الدورة');
  await getOrCreateLookup(db, 'notification_type', 'event_registered', 'Event Registered', 'تم التسجيل في الحدث');

  // Post types
  await getOrCreateLookup(db, 'post_type', 'text', 'Text', 'نص');
  await getOrCreateLookup(db, 'post_type', 'image', 'Image', 'صورة');

  // Visibility types
  await getOrCreateLookup(db, 'visibility', 'public', 'Public', 'عام');
  await getOrCreateLookup(db, 'visibility', 'private', 'Private', 'خاص');
}

/**
 * Clean up test data (soft delete)
 */
export async function cleanupTestData(
  db: ReturnType<typeof createTestDatabase>,
  table: any,
  condition?: any,
) {
  if (condition) {
    await db.update(table).set({ isDeleted: true, deletedAt: new Date() }).where(condition);
  } else {
    await db.update(table).set({ isDeleted: true, deletedAt: new Date() });
  }
}

/**
 * Hard delete test data (use with caution)
 */
export async function hardDeleteTestData(
  db: ReturnType<typeof createTestDatabase>,
  table: any,
  condition?: any,
) {
  if (condition) {
    await db.delete(table).where(condition);
  } else {
    await db.delete(table);
  }
}
