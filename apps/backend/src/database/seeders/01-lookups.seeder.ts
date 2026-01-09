import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { lookupTypes, lookups } from '@leap-lms/database';

export async function seedLookups() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('🌱 Seeding lookup types and lookups...');

  // Lookup Types
  const types = await db.insert(lookupTypes).values([
    { code: 'course_level', name: 'Course Level', description: 'Course difficulty levels' },
    { code: 'course_status', name: 'Course Status', description: 'Course publication status' },
    { code: 'enrollment_status', name: 'Enrollment Status', description: 'Student enrollment status' },
    { code: 'payment_method', name: 'Payment Method', description: 'Payment methods' },
    { code: 'job_type', name: 'Job Type', description: 'Employment types' },
    { code: 'event_type', name: 'Event Type', description: 'Event types' },
    { code: 'notification_type', name: 'Notification Type', description: 'Notification types' },
    { code: 'post_visibility', name: 'Post Visibility', description: 'Post visibility levels' },
  ]).returning();

  // Lookups for each type
  await db.insert(lookups).values([
    // Course Levels
    { lookupTypeId: types[0].id, code: 'beginner', nameEn: 'Beginner', nameAr: 'مبتدئ', descriptionEn: 'Suitable for beginners', descriptionAr: 'مناسب للمبتدئين', sortOrder: 1 },
    { lookupTypeId: types[0].id, code: 'intermediate', nameEn: 'Intermediate', nameAr: 'متوسط', descriptionEn: 'Requires basic knowledge', descriptionAr: 'يتطلب معرفة أساسية', sortOrder: 2 },
    { lookupTypeId: types[0].id, code: 'advanced', nameEn: 'Advanced', nameAr: 'متقدم', descriptionEn: 'For experienced learners', descriptionAr: 'للمتعلمين ذوي الخبرة', sortOrder: 3 },
    
    // Course Status
    { lookupTypeId: types[1].id, code: 'draft', nameEn: 'Draft', nameAr: 'مسودة', descriptionEn: 'Course is being prepared', descriptionAr: 'جاري تحضير الدورة', sortOrder: 1 },
    { lookupTypeId: types[1].id, code: 'published', nameEn: 'Published', nameAr: 'منشور', descriptionEn: 'Course is live', descriptionAr: 'الدورة منشورة', sortOrder: 2 },
    { lookupTypeId: types[1].id, code: 'archived', nameEn: 'Archived', nameAr: 'مؤرشف', descriptionEn: 'Course is archived', descriptionAr: 'الدورة مؤرشفة', sortOrder: 3 },
    
    // Payment Methods
    { lookupTypeId: types[3].id, code: 'paypal', nameEn: 'PayPal', nameAr: 'باي بال', descriptionEn: 'Pay with PayPal', descriptionAr: 'الدفع عبر باي بال', sortOrder: 1 },
    { lookupTypeId: types[3].id, code: 'stripe', nameEn: 'Stripe', nameAr: 'سترايب', descriptionEn: 'Pay with Stripe', descriptionAr: 'الدفع عبر سترايب', sortOrder: 2 },
    { lookupTypeId: types[3].id, code: 'bank_transfer', nameEn: 'Bank Transfer', nameAr: 'تحويل بنكي', descriptionEn: 'Bank transfer', descriptionAr: 'تحويل بنكي', sortOrder: 3 },
    
    // Job Types
    { lookupTypeId: types[4].id, code: 'full_time', nameEn: 'Full Time', nameAr: 'دوام كامل', sortOrder: 1 },
    { lookupTypeId: types[4].id, code: 'part_time', nameEn: 'Part Time', nameAr: 'دوام جزئي', sortOrder: 2 },
    { lookupTypeId: types[4].id, code: 'contract', nameEn: 'Contract', nameAr: 'عقد', sortOrder: 3 },
    { lookupTypeId: types[4].id, code: 'internship', nameEn: 'Internship', nameAr: 'تدريب', sortOrder: 4 },
    
    // Event Types
    { lookupTypeId: types[5].id, code: 'online', nameEn: 'Online', nameAr: 'عن بعد', sortOrder: 1 },
    { lookupTypeId: types[5].id, code: 'in_person', nameEn: 'In Person', nameAr: 'حضوري', sortOrder: 2 },
    { lookupTypeId: types[5].id, code: 'hybrid', nameEn: 'Hybrid', nameAr: 'مختلط', sortOrder: 3 },
  ]);

  console.log('✅ Lookups seeded successfully!');
  await pool.end();
}
