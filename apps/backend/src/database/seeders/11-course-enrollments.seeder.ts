import { drizzle } from 'drizzle-orm/node-postgres';
import { enrollments, users, courses, lookups, subscriptions } from '@leap-lms/database';
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

  // Get subscriptions if any exist (for subscription-based enrollments)
  const existingSubscriptions = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .limit(10);

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
          .set(enrollmentData )
          .where(eq(enrollments.id, existing.id));
        console.log(`  ↻ Updated enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId}`);
      }
      return existing;
    } else {
      try {
        // If subscriptionId is not set and DB requires it, we need to handle it
        // For purchase enrollments, we'll omit subscriptionId and let the insert fail if needed
        // Then we can catch and handle the error
        const insertData = { ...enrollmentData };
        
        // Remove subscriptionId if it's undefined (for purchase enrollments)
        // The database will either accept NULL or reject it, and we'll handle accordingly
        if (insertData.subscriptionId === undefined) {
          delete insertData.subscriptionId;
        }
        
        const [newEnrollment] = await db.insert(enrollments).values(insertData ).returning();
        console.log(`  ✓ Created enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId}`);
        return newEnrollment;
      } catch (error: any) {
        // Handle foreign key constraint error for subscription_id
        if (error.code === '23503' && error.constraint === 'enrollments_subscription_id_subscriptions_id_fk') {
          // subscription_id FK constraint failed - try using raw SQL with explicit NULL
          try {
            const client = await pool.connect();
            try {
              const result = await client.query(`
                INSERT INTO enrollments (
                  "userId", course_id, enrollment_type_id, status_id, 
                  subscription_id, amount_paid, enrolled_at, expires_at, 
                  completed_at, progress_percentage, last_accessed_at, "isDeleted"
                ) 
                VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
              `, [
                enrollmentData.userId,
                enrollmentData.courseId,
                enrollmentData.enrollmentTypeId,
                enrollmentData.statusId,
                enrollmentData.amountPaid || null,
                enrollmentData.enrolledAt,
                enrollmentData.expiresAt || null,
                enrollmentData.completedAt || null,
                enrollmentData.progressPercentage,
                enrollmentData.lastAccessedAt || null,
                false
              ]);
              
              if (result.rows && result.rows[0]) {
                const [newEnrollment] = await db
                  .select()
                  .from(enrollments)
                  .where(eq(enrollments.id, result.rows[0].id))
                  .limit(1);
                
                if (newEnrollment) {
                  console.log(`  ✓ Created enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId} (with NULL subscription_id)`);
                  return newEnrollment;
                }
              }
            } finally {
              client.release();
            }
          } catch (sqlError: any) {
            // If raw SQL also fails, skip this enrollment
            console.log(`  ⚠️  Skipping enrollment for user ${enrollmentData.userId} in course ${enrollmentData.courseId} - subscription_id constraint issue`);
            return null;
          }
        }
        
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
              .set(enrollmentData )
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
      // For seeding, we'll use purchase type mostly to avoid subscription_id issues
      // Only use subscription type if we have existing subscriptions and it's a subscription course
      const shouldUseSubscription = course.enrollmentTypeId === subscriptionType?.id && existingSubscriptions.length > 0 && Math.random() > 0.7;
      const enrollmentTypeId = shouldUseSubscription
        ? (subscriptionType?.id || defaultEnrollmentTypeId)
        : (purchaseType?.id || defaultEnrollmentTypeId);
      
      // Random status (mostly active, some completed)
      const statusId = Math.random() > 0.8 ? (completedStatus?.id || defaultStatusId) : (activeStatus?.id || defaultStatusId);
      
      // Random progress (0-100%)
      const progressPercentage = statusId === completedStatus?.id ? 100.00 : parseFloat((Math.random() * 100).toFixed(2));

      // Get subscription ID if this is a subscription enrollment
      let subscriptionIdValue: number | undefined = undefined;
      if (enrollmentTypeId === subscriptionType?.id && existingSubscriptions.length > 0) {
        // Use a random existing subscription
        subscriptionIdValue = existingSubscriptions[Math.floor(Math.random() * existingSubscriptions.length)].id;
      }

      const enrollmentData: any = {
        userId: student.id,
        courseId: course.id,
        enrollmentTypeId,
        statusId,
        amountPaid: enrollmentTypeId === purchaseType?.id ? (course.price || null) : null,
        enrolledAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        expiresAt: enrollmentTypeId === subscriptionType?.id ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days from now for subscriptions
        completedAt: statusId === completedStatus?.id ? new Date() : null,
        progressPercentage,
        lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
      };

      // Handle subscription_id based on enrollment type
      // If database requires NOT NULL, we need to provide a value
      // For purchase enrollments, we'll omit subscriptionId (let DB handle default or error)
      // For subscription enrollments, we must provide a valid subscription ID
      if (subscriptionIdValue !== undefined) {
        enrollmentData.subscriptionId = subscriptionIdValue;
      }
      // For purchase enrollments, don't set subscriptionId - let the database schema handle it
      // If the DB truly requires NOT NULL, this will fail and we'll need to create a default subscription

      enrollmentsToCreate.push(enrollmentData);
    }
  }

  // Create enrollments in batches
  let createdCount = 0;
  let skippedCount = 0;
  for (const enrollmentData of enrollmentsToCreate) {
    const result = await upsertEnrollment(enrollmentData);
    if (result) {
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} enrollments due to subscription_id constraint`);
  }
  console.log(`✅ Created ${createdCount} course enrollments successfully!`);
  await pool.end();
}
