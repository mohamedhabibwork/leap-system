import { drizzle } from 'drizzle-orm/node-postgres';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

/**
 * This seeder ensures that enrollment status lookups exist.
 * These should already be created by the lookups seeder,
 * but this provides a verification/backup mechanism.
 */
export async function seedCourseEnrollmentStatuses() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Verifying enrollment status lookups...');

  // Get enrollment status lookup type
  const [enrollmentStatusType] = await db
    .select({ id: lookupTypes.id })
    .from(lookupTypes)
    .where(eq(lookupTypes.code, 'enrollment_status'))
    .limit(1);

  if (!enrollmentStatusType) {
    console.log('  ⚠️  Enrollment status lookup type not found. Please seed lookups first.');
    await pool.end();
    return;
  }

  // Verify enrollment statuses exist
  const expectedStatuses = ['active', 'completed', 'expired', 'dropped', 'cancelled'];
  const foundStatuses: string[] = [];
  const missingStatuses: string[] = [];

  for (const statusCode of expectedStatuses) {
    const [status] = await db
      .select({ id: lookups.id, code: lookups.code })
      .from(lookups)
      .where(
        and(
          eq(lookups.lookupTypeId, enrollmentStatusType.id),
          eq(lookups.code, statusCode)
        )
      )
      .limit(1);

    if (status) {
      foundStatuses.push(statusCode);
    } else {
      missingStatuses.push(statusCode);
    }
  }

  if (missingStatuses.length === 0) {
    console.log(`  ✓ All enrollment statuses verified: ${foundStatuses.join(', ')}`);
  } else {
    console.log(`  ⚠️  Some enrollment statuses are missing. Please run the lookups seeder.`);
    console.log(`    - Found: ${foundStatuses.join(', ')}`);
    console.log(`    - Missing: ${missingStatuses.join(', ')}`);
  }

  console.log('✅ Enrollment status verification completed!');
  await pool.end();
}
