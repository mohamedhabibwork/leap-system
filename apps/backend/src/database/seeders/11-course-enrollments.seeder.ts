import { drizzle } from 'drizzle-orm/node-postgres';
import { enrollments, users, courses, lookups } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourseEnrollments() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding course enrollments...');

  // Get students (users with user/student role)
  const [studentRole] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'user'))
    .limit(1);

  const students = await db
    .select()
    .from(users)
    .where(eq(users.roleId, studentRole?.id || 0))
    .limit(50);

  if (students.length === 0) {
    console.log('  ⚠️  No students found. Please seed users first.');
    await pool.end();
    return;
  }

  // Get all published courses
  const allCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.isDeleted, false))
    .limit(20);

  if (allCourses.length === 0) {
    console.log('  ⚠️  No courses found. Please seed courses first.');
    await pool.end();
    return;
  }

  // Get enrollment type lookups
  const [purchaseType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'purchase'))
    .limit(1);

  const [subscriptionType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'subscription'))
    .limit(1);

  // Get enrollment status lookups
  const [activeStatus] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'active'))
    .limit(1);

  const [completedStatus] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'completed'))
    .limit(1);

  const defaultEnrollmentTypeId = purchaseType?.id || subscriptionType?.id || 1;
  const defaultStatusId = activeStatus?.id || 1;

  // Helper function to upsert enrollment
  const upsertEnrollment = async (enrollmentData: any) => {
    const [existing] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, enrollmentData.userId),
          eq(enrollments.courseId, enrollmentData.courseId)
        )
      )
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.enrollmentTypeId !== enrollmentData.enrollmentTypeId ||
        existing.statusId !== enrollmentData.statusId ||
        existing.progressPercentage !== enrollmentData.progressPercentage;

      if (needsUpdate) {
        await db
          .update(enrollments)
          .set(enrollmentData as any)
          .where(eq(enrollments.id, existing.id));
        console.log(`  ↻ Updated enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId}`);
      }
      return existing;
    } else {
      try {
        const [newEnrollment] = await db.insert(enrollments).values(enrollmentData as any).returning();
        console.log(`  ✓ Created enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId}`);
        return newEnrollment;
      } catch (error: any) {
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(enrollments)
            .where(
              and(
                eq(enrollments.userId, enrollmentData.userId),
                eq(enrollments.courseId, enrollmentData.courseId)
              )
            )
            .limit(1);
          
          if (existing) {
            await db
              .update(enrollments)
              .set(enrollmentData as any)
              .where(eq(enrollments.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  // Create random enrollments
  const enrollmentsToCreate = [];
  const enrollmentCount = Math.min(students.length * 2, 100); // Max 100 enrollments

  for (let i = 0; i < enrollmentCount; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const course = allCourses[Math.floor(Math.random() * allCourses.length)];
    
    // Check if enrollment already exists
    const [existing] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, student.id),
          eq(enrollments.courseId, course.id)
        )
      )
      .limit(1);

    if (!existing) {
      // Determine enrollment type based on course
      const enrollmentTypeId = course.enrollmentTypeId || defaultEnrollmentTypeId;
      
      // Random status (mostly active, some completed)
      const statusId = Math.random() > 0.8 ? (completedStatus?.id || defaultStatusId) : (activeStatus?.id || defaultStatusId);
      
      // Random progress (0-100%)
      const progressPercentage = statusId === completedStatus?.id ? '100.00' : (Math.random() * 100).toFixed(2);

      const enrollmentData = {
        userId: student.id,
        courseId: course.id,
        enrollmentTypeId,
        statusId,
        amountPaid: course.price || null,
        enrolledAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        expiresAt: enrollmentTypeId === subscriptionType?.id ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days from now for subscriptions
        completedAt: statusId === completedStatus?.id ? new Date() : null,
        progressPercentage,
        lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
      };

      enrollmentsToCreate.push(enrollmentData);
    }
  }

  // Create enrollments in batches
  for (const enrollmentData of enrollmentsToCreate) {
    await upsertEnrollment(enrollmentData);
  }

  console.log(`✅ Created ${enrollmentsToCreate.length} course enrollments successfully!`);
  await pool.end();
}
