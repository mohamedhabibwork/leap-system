import { drizzle } from 'drizzle-orm/node-postgres';
import { courseSections, courses } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourseSections() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding course sections...');

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

  // Helper function to upsert section
  const upsertSection = async (sectionData: any) => {
    const [existing] = await db
      .select()
      .from(courseSections)
      .where(
        and(
          eq(courseSections.courseId, sectionData.courseId),
          eq(courseSections.titleEn, sectionData.titleEn)
        )
      )
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.titleAr !== sectionData.titleAr ||
        existing.descriptionEn !== sectionData.descriptionEn ||
        existing.descriptionAr !== sectionData.descriptionAr ||
        existing.displayOrder !== sectionData.displayOrder;

      if (needsUpdate) {
        await db
          .update(courseSections)
          .set(sectionData as any)
          .where(eq(courseSections.id, existing.id));
        console.log(`  ↻ Updated section: ${sectionData.titleEn}`);
      }
      return existing;
    } else {
      try {
        const [newSection] = await db.insert(courseSections).values(sectionData as any).returning();
        console.log(`  ✓ Created section: ${sectionData.titleEn}`);
        return newSection;
      } catch (error: any) {
        if (error.code === '23505') {
          // Duplicate UUID, try to find and update
          const [existing] = await db
            .select()
            .from(courseSections)
            .where(
              and(
                eq(courseSections.courseId, sectionData.courseId),
                eq(courseSections.titleEn, sectionData.titleEn)
              )
            )
            .limit(1);
          
          if (existing) {
            await db
              .update(courseSections)
              .set(sectionData as any)
              .where(eq(courseSections.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  // Create sections for each course
  const sectionsToSeed = [
    {
      titleEn: 'Introduction',
      titleAr: 'مقدمة',
      descriptionEn: 'Course introduction and overview',
      descriptionAr: 'مقدمة الدورة ونظرة عامة',
      displayOrder: 1,
    },
    {
      titleEn: 'Fundamentals',
      titleAr: 'الأساسيات',
      descriptionEn: 'Core concepts and fundamentals',
      descriptionAr: 'المفاهيم الأساسية والأساسيات',
      displayOrder: 2,
    },
    {
      titleEn: 'Intermediate Topics',
      titleAr: 'المواضيع المتوسطة',
      descriptionEn: 'Intermediate level content',
      descriptionAr: 'محتوى المستوى المتوسط',
      displayOrder: 3,
    },
    {
      titleEn: 'Advanced Concepts',
      titleAr: 'المفاهيم المتقدمة',
      descriptionEn: 'Advanced topics and techniques',
      descriptionAr: 'المواضيع والتقنيات المتقدمة',
      displayOrder: 4,
    },
    {
      titleEn: 'Projects and Practice',
      titleAr: 'المشاريع والممارسة',
      descriptionEn: 'Hands-on projects and practice exercises',
      descriptionAr: 'مشاريع عملية وتمارين',
      displayOrder: 5,
    },
  ];

  for (const course of allCourses) {
    for (let i = 0; i < Math.min(5, sectionsToSeed.length); i++) {
      const sectionData = {
        ...sectionsToSeed[i],
        courseId: course.id,
      };
      await upsertSection(sectionData);
    }
  }

  console.log('✅ Course sections seeded successfully!');
  await pool.end();
}
