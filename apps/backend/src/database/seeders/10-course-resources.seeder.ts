import { drizzle } from 'drizzle-orm/node-postgres';
import { courseResources, courses, courseSections, lessons, lookups } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourseResources() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding course resources...');

  // Get all courses
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

  // Get resource type lookups
  const [pdfType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'pdf'))
    .limit(1);

  const [videoType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'video'))
    .limit(1);

  const [documentType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'document'))
    .limit(1);

  const defaultResourceTypeId = pdfType?.id || documentType?.id || 1;

  // Helper function to upsert resource
  const upsertResource = async (resourceData: any) => {
    const [existing] = await db
      .select()
      .from(courseResources)
      .where(
        and(
          eq(courseResources.courseId, resourceData.courseId),
          eq(courseResources.titleEn, resourceData.titleEn)
        )
      )
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.titleAr !== resourceData.titleAr ||
        existing.fileUrl !== resourceData.fileUrl ||
        existing.resourceTypeId !== resourceData.resourceTypeId;

      if (needsUpdate) {
        await db
          .update(courseResources)
          .set(resourceData as any)
          .where(eq(courseResources.id, existing.id));
        console.log(`  ↻ Updated resource: ${resourceData.titleEn}`);
      }
      return existing;
    } else {
      try {
        const [newResource] = await db.insert(courseResources).values(resourceData as any).returning();
        console.log(`  ✓ Created resource: ${resourceData.titleEn}`);
        return newResource;
      } catch (error: any) {
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(courseResources)
            .where(
              and(
                eq(courseResources.courseId, resourceData.courseId),
                eq(courseResources.titleEn, resourceData.titleEn)
              )
            )
            .limit(1);
          
          if (existing) {
            await db
              .update(courseResources)
              .set(resourceData as any)
              .where(eq(courseResources.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  // Resource templates
  const resourceTemplates = [
    {
      titleEn: 'Course Syllabus',
      titleAr: 'منهج الدورة',
      descriptionEn: 'Complete course syllabus and learning objectives',
      descriptionAr: 'منهج الدورة الكامل وأهداف التعلم',
      resourceTypeId: pdfType?.id || defaultResourceTypeId,
      fileUrl: 'https://example.com/resources/syllabus.pdf',
      fileName: 'syllabus.pdf',
      fileSize: 1024000,
      displayOrder: 1,
    },
    {
      titleEn: 'Additional Reading Materials',
      titleAr: 'مواد قراءة إضافية',
      descriptionEn: 'Recommended books and articles',
      descriptionAr: 'كتب ومقالات موصى بها',
      resourceTypeId: pdfType?.id || defaultResourceTypeId,
      fileUrl: 'https://example.com/resources/reading-materials.pdf',
      fileName: 'reading-materials.pdf',
      fileSize: 2048000,
      displayOrder: 2,
    },
    {
      titleEn: 'Code Examples',
      titleAr: 'أمثلة الكود',
      descriptionEn: 'Downloadable code examples and templates',
      descriptionAr: 'أمثلة الكود والقوالب القابلة للتنزيل',
      resourceTypeId: documentType?.id || defaultResourceTypeId,
      fileUrl: 'https://example.com/resources/code-examples.zip',
      fileName: 'code-examples.zip',
      fileSize: 5120000,
      displayOrder: 3,
    },
  ];

  // Create resources for each course
  for (const course of allCourses) {
    for (let i = 0; i < Math.min(3, resourceTemplates.length); i++) {
      const resourceData = {
        ...resourceTemplates[i],
        courseId: course.id,
        sectionId: null,
        lessonId: null,
      };
      await upsertResource(resourceData);
    }
  }

  console.log('✅ Course resources seeded successfully!');
  await pool.end();
}
