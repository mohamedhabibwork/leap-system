import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDrizzleDatabase } from './db-helper';

/**
 * This seeder ensures that enrollment type lookups exist.
 * These should already be created by the lookups seeder,
 * but this provides a verification/backup mechanism.
 */
export async function seedCourseEnrollmentTypes() {
  const { db, pool } = createDrizzleDatabase();

  console.log('🌱 Verifying enrollment type lookups...');

  // Get enrollment type lookup type
  const [enrollmentTypeType] = await db
    .select({ id: lookupTypes.id })
    .from(lookupTypes)
    .where(eq(lookupTypes.code, 'enrollment_type'))
    .limit(1);

  if (!enrollmentTypeType) {
    console.log('  ⚠️  Enrollment type lookup type not found. Please seed lookups first.');
    await pool.end();
    return;
  }

  // Verify enrollment types exist
  const [purchaseType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(
      and(
        eq(lookups.lookupTypeId, enrollmentTypeType.id),
        eq(lookups.code, 'purchase')
      )
    )
    .limit(1);

  const [subscriptionType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(
      and(
        eq(lookups.lookupTypeId, enrollmentTypeType.id),
        eq(lookups.code, 'subscription')
      )
    )
    .limit(1);

  if (purchaseType && subscriptionType) {
    console.log('  ✓ Enrollment types verified: purchase, subscription');
  } else {
    console.log('  ⚠️  Some enrollment types are missing. Please run the lookups seeder.');
    if (!purchaseType) console.log('    - Missing: purchase');
    if (!subscriptionType) console.log('    - Missing: subscription');
  }

  console.log('✅ Enrollment type verification completed!');
  await pool.end();
}
