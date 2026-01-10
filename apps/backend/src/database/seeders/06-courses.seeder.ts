import { drizzle } from 'drizzle-orm/node-postgres';
import { courses, courseCategories, users, lookups } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourses() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding courses...');

  // Get instructors (users with instructor role)
  const [instructorLookup] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'instructor'))
    .limit(1);

  const instructors = await db
    .select()
    .from(users)
    .where(eq(users.roleId, instructorLookup?.id || 0))
    .limit(10);

  if (instructors.length === 0) {
    console.log('  ⚠️  No instructors found. Please seed users first.');
    await pool.end();
    return;
  }

  // Get course status lookup (published)
  const [publishedStatus] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'published'))
    .limit(1);

  if (!publishedStatus) {
    console.log('  ⚠️  Published status lookup not found. Please seed lookups first.');
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

  // Get course categories
  const categories = await db
    .select()
    .from(courseCategories)
    .where(eq(courseCategories.isActive, true))
    .limit(20);

  if (categories.length === 0) {
    console.log('  ⚠️  No course categories found. Please seed course categories first.');
    await pool.end();
    return;
  }

  // Helper function to upsert course
  const upsertCourse = async (courseData: any) => {
    const [existing] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseData.slug))
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.titleEn !== courseData.titleEn ||
        existing.titleAr !== courseData.titleAr ||
        existing.descriptionEn !== courseData.descriptionEn ||
        existing.instructorId !== courseData.instructorId ||
        existing.categoryId !== courseData.categoryId;

      if (needsUpdate) {
        await db
          .update(courses)
          .set(courseData as any)
          .where(eq(courses.id, existing.id));
        console.log(`  ↻ Updated course: ${courseData.titleEn}`);
      }
      return existing;
    } else {
      try {
        const [newCourse] = await db.insert(courses).values(courseData as any).returning();
        console.log(`  ✓ Created course: ${courseData.titleEn}`);
        return newCourse;
      } catch (error: any) {
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(courses)
            .where(eq(courses.slug, courseData.slug))
            .limit(1);
          
          if (existing) {
            await db
              .update(courses)
              .set(courseData as any)
              .where(eq(courses.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  const coursesToSeed = [
    {
      titleEn: 'Complete Web Development Bootcamp',
      titleAr: 'معسكر تطوير الويب الكامل',
      slug: 'complete-web-development-bootcamp',
      descriptionEn: 'Master HTML, CSS, JavaScript, React, Node.js, and more',
      descriptionAr: 'إتقان HTML و CSS و JavaScript و React و Node.js والمزيد',
      objectivesEn: 'Build full-stack web applications, understand modern frameworks, deploy applications',
      objectivesAr: 'بناء تطبيقات ويب كاملة المكدس، فهم الأطر الحديثة، نشر التطبيقات',
      requirementsEn: 'Basic computer skills, no prior programming experience required',
      requirementsAr: 'مهارات الكمبيوتر الأساسية، لا يلزم خبرة برمجية سابقة',
      instructorId: instructors[0]?.id || 1,
      categoryId: categories.find(c => c.slug === 'web-development')?.id || categories[0]?.id,
      statusId: publishedStatus.id,
      enrollmentTypeId: purchaseType?.id || null,
      price: '99.99',
      thumbnailUrl: 'https://via.placeholder.com/800x450?text=Web+Development',
      videoUrl: 'https://example.com/videos/web-dev-intro.mp4',
      durationHours: 120,
      maxStudents: 100,
      allowSubscriptionAccess: true,
      allowPurchase: true,
      publishDate: new Date(),
      isFeatured: true,
    },
    {
      titleEn: 'React Mastery Course',
      titleAr: 'دورة إتقان React',
      slug: 'react-mastery-course',
      descriptionEn: 'Deep dive into React hooks, context, and advanced patterns',
      descriptionAr: 'غوص عميق في React hooks و context والأنماط المتقدمة',
      objectivesEn: 'Master React ecosystem, build complex applications, optimize performance',
      objectivesAr: 'إتقان نظام React، بناء تطبيقات معقدة، تحسين الأداء',
      requirementsEn: 'Basic JavaScript knowledge',
      requirementsAr: 'معرفة أساسية بـ JavaScript',
      instructorId: instructors[0]?.id || 1,
      categoryId: categories.find(c => c.slug === 'frontend-development')?.id || categories[0]?.id,
      statusId: publishedStatus.id,
      enrollmentTypeId: subscriptionType?.id || null,
      price: '79.99',
      thumbnailUrl: 'https://via.placeholder.com/800x450?text=React+Mastery',
      videoUrl: 'https://example.com/videos/react-intro.mp4',
      durationHours: 60,
      maxStudents: 50,
      allowSubscriptionAccess: true,
      allowPurchase: true,
      publishDate: new Date(),
      isFeatured: true,
    },
    {
      titleEn: 'Node.js Backend Development',
      titleAr: 'تطوير الواجهة الخلفية بـ Node.js',
      slug: 'nodejs-backend-development',
      descriptionEn: 'Build scalable backend APIs with Node.js and Express',
      descriptionAr: 'بناء واجهات برمجية خلفية قابلة للتوسع باستخدام Node.js و Express',
      objectivesEn: 'Create RESTful APIs, implement authentication, work with databases',
      objectivesAr: 'إنشاء واجهات برمجية RESTful، تنفيذ المصادقة، العمل مع قواعد البيانات',
      requirementsEn: 'JavaScript fundamentals, basic understanding of HTTP',
      requirementsAr: 'أساسيات JavaScript، فهم أساسي لـ HTTP',
      instructorId: instructors[1]?.id || instructors[0]?.id || 1,
      categoryId: categories.find(c => c.slug === 'backend-development')?.id || categories[0]?.id,
      statusId: publishedStatus.id,
      enrollmentTypeId: purchaseType?.id || null,
      price: '89.99',
      thumbnailUrl: 'https://via.placeholder.com/800x450?text=Node.js',
      videoUrl: 'https://example.com/videos/nodejs-intro.mp4',
      durationHours: 80,
      maxStudents: 75,
      allowSubscriptionAccess: true,
      allowPurchase: true,
      publishDate: new Date(),
      isFeatured: false,
    },
    {
      titleEn: 'Mobile App Development with React Native',
      titleAr: 'تطوير تطبيقات الهواتف باستخدام React Native',
      slug: 'mobile-app-development-react-native',
      descriptionEn: 'Build cross-platform mobile apps with React Native',
      descriptionAr: 'بناء تطبيقات الهواتف المحمولة متعددة المنصات باستخدام React Native',
      objectivesEn: 'Create iOS and Android apps, use native modules, publish to app stores',
      objectivesAr: 'إنشاء تطبيقات iOS و Android، استخدام الوحدات الأصلية، النشر في متاجر التطبيقات',
      requirementsEn: 'React knowledge recommended',
      requirementsAr: 'معرفة React موصى بها',
      instructorId: instructors[2]?.id || instructors[0]?.id || 1,
      categoryId: categories.find(c => c.slug === 'mobile-development')?.id || categories[0]?.id,
      statusId: publishedStatus.id,
      enrollmentTypeId: subscriptionType?.id || null,
      price: '109.99',
      thumbnailUrl: 'https://via.placeholder.com/800x450?text=React+Native',
      videoUrl: 'https://example.com/videos/react-native-intro.mp4',
      durationHours: 100,
      maxStudents: 60,
      allowSubscriptionAccess: true,
      allowPurchase: true,
      publishDate: new Date(),
      isFeatured: true,
    },
    {
      titleEn: 'Data Science with Python',
      titleAr: 'علوم البيانات باستخدام Python',
      slug: 'data-science-with-python',
      descriptionEn: 'Learn data analysis, machine learning, and visualization with Python',
      descriptionAr: 'تعلم تحليل البيانات والتعلم الآلي والتصور باستخدام Python',
      objectivesEn: 'Analyze datasets, build ML models, create visualizations',
      objectivesAr: 'تحليل مجموعات البيانات، بناء نماذج التعلم الآلي، إنشاء تصورات',
      requirementsEn: 'Basic Python knowledge',
      requirementsAr: 'معرفة أساسية بـ Python',
      instructorId: instructors[3]?.id || instructors[0]?.id || 1,
      categoryId: categories.find(c => c.slug === 'data-science')?.id || categories[0]?.id,
      statusId: publishedStatus.id,
      enrollmentTypeId: purchaseType?.id || null,
      price: '119.99',
      thumbnailUrl: 'https://via.placeholder.com/800x450?text=Data+Science',
      videoUrl: 'https://example.com/videos/data-science-intro.mp4',
      durationHours: 90,
      maxStudents: 80,
      allowSubscriptionAccess: true,
      allowPurchase: true,
      publishDate: new Date(),
      isFeatured: false,
    },
  ];

  // Upsert all courses
  for (const courseData of coursesToSeed) {
    await upsertCourse(courseData);
  }

  console.log('✅ Courses seeded successfully!');
  await pool.end();
}
