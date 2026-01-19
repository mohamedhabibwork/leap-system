import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDrizzleDatabase } from './db-helper';

/**
 * This seeder ensures that enrollment status lookups exist.
 * These should already be created by the lookups seeder,
 * but this provides a verification/backup mechanism.
 */
export async function seedCourseEnrollmentStatuses() {
  const { db, pool } = createDrizzleDatabase();

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

  // Verify and create enrollment statuses if missing
  const expectedStatuses = [
    { code: 'active', nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Enrollment is active', descriptionAr: 'التسجيل نشط', sortOrder: 1 },
    { code: 'completed', nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Course completed', descriptionAr: 'الدورة مكتملة', sortOrder: 2 },
    { code: 'expired', nameEn: 'Expired', nameAr: 'منتهي', descriptionEn: 'Enrollment expired', descriptionAr: 'التسجيل منتهي', sortOrder: 3 },
    { code: 'dropped', nameEn: 'Dropped', nameAr: 'متروك', descriptionEn: 'Student dropped course', descriptionAr: 'الطالب ترك الدورة', sortOrder: 4 },
    { code: 'cancelled', nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Enrollment cancelled', descriptionAr: 'التسجيل ملغي', sortOrder: 5 },
  ];
  
  const foundStatuses: string[] = [];

  // Helper function similar to upsertLookup from lookups seeder
  const upsertEnrollmentStatus = async (statusData: any) => {
    // First check by code (since code is unique across all lookups)
    const [existingByCode] = await db
      .select()
      .from(lookups)
      .where(eq(lookups.code, statusData.code))
      .limit(1);

    // Also check by lookupTypeId + code combination
    const [existingByTypeAndCode] = await db
      .select()
      .from(lookups)
      .where(
        and(
          eq(lookups.lookupTypeId, enrollmentStatusType.id),
          eq(lookups.code, statusData.code)
        )
      )
      .limit(1);

    const existing = existingByTypeAndCode || existingByCode;

    if (existing) {
      // If found by code but different lookupTypeId, update the lookupTypeId
      if (existing.lookupTypeId !== enrollmentStatusType.id) {
        await db
          .update(lookups)
          .set({
            lookupTypeId: enrollmentStatusType.id,
            nameEn: statusData.nameEn,
            nameAr: statusData.nameAr,
            descriptionEn: statusData.descriptionEn,
            descriptionAr: statusData.descriptionAr,
            sortOrder: statusData.sortOrder,
          } )
          .where(eq(lookups.id, existing.id));
        console.log(`  ↻ Updated enrollment status: ${statusData.code} (moved to enrollment_status type)`);
        return existing;
      }

      // Update if different
      const needsUpdate =
        existing.nameEn !== statusData.nameEn ||
        existing.nameAr !== statusData.nameAr ||
        existing.descriptionEn !== statusData.descriptionEn ||
        existing.descriptionAr !== statusData.descriptionAr ||
        existing.sortOrder !== statusData.sortOrder;

      if (needsUpdate) {
        await db
          .update(lookups)
          .set({
            nameEn: statusData.nameEn,
            nameAr: statusData.nameAr,
            descriptionEn: statusData.descriptionEn,
            descriptionAr: statusData.descriptionAr,
            sortOrder: statusData.sortOrder,
          } )
          .where(eq(lookups.id, existing.id));
        console.log(`  ↻ Updated enrollment status: ${statusData.code}`);
      }
      return existing;
    } else {
      try {
        const [newStatus] = await db.insert(lookups).values({
          lookupTypeId: enrollmentStatusType.id,
          code: statusData.code,
          nameEn: statusData.nameEn,
          nameAr: statusData.nameAr,
          descriptionEn: statusData.descriptionEn,
          descriptionAr: statusData.descriptionAr,
          sortOrder: statusData.sortOrder,
        } ).returning();
        console.log(`  ✓ Created enrollment status: ${statusData.code}`);
        return newStatus;
      } catch (error: any) {
        // Handle duplicate key error - try to find and update
        if (error.code === '23505' && error.constraint === 'lookups_code_unique') {
          const [existing] = await db
            .select()
            .from(lookups)
            .where(eq(lookups.code, statusData.code))
            .limit(1);
          
          if (existing) {
            // Update to enrollment_status type
            await db
              .update(lookups)
              .set({
                lookupTypeId: enrollmentStatusType.id,
                nameEn: statusData.nameEn,
                nameAr: statusData.nameAr,
                descriptionEn: statusData.descriptionEn,
                descriptionAr: statusData.descriptionAr,
                sortOrder: statusData.sortOrder,
              } )
              .where(eq(lookups.id, existing.id));
            console.log(`  ↻ Updated enrollment status: ${statusData.code} (moved to enrollment_status type)`);
            return existing;
          }
        }
        throw error;
      }
    }
  };

  for (const statusData of expectedStatuses) {
    const status = await upsertEnrollmentStatus({
      ...statusData,
      lookupTypeId: enrollmentStatusType.id,
    });

    if (status) {
      foundStatuses.push(statusData.code);
    }
  }

  if (foundStatuses.length > 0) {
    console.log(`  ✓ Verified enrollment statuses: ${foundStatuses.join(', ')}`);
  }

  console.log('✅ Enrollment status verification completed!');
  await pool.end();
}
