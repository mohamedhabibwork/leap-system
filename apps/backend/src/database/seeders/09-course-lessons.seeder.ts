import { drizzle } from 'drizzle-orm/node-postgres';
import { lessons, courseSections, lookups } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourseLessons() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding course lessons...');

  // Get all course sections
  const allSections = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.isDeleted, false))
    .limit(100);

  if (allSections.length === 0) {
    console.log('  ⚠️  No course sections found. Please seed course sections first.');
    await pool.end();
    return;
  }

  // Content type lookups will be fetched below

  // Get content type lookups (video, text, quiz, assignment)
  const [videoType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'video'))
    .limit(1);

  const [textType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'text'))
    .limit(1);

  const [quizType] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'quiz'))
    .limit(1);

  // Use video as default if not found
  const defaultContentTypeId = videoType?.id || textType?.id || 1;

  // Helper function to upsert lesson
  const upsertLesson = async (lessonData: any) => {
    const [existing] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.sectionId, lessonData.sectionId),
          eq(lessons.titleEn, lessonData.titleEn)
        )
      )
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.titleAr !== lessonData.titleAr ||
        existing.descriptionEn !== lessonData.descriptionEn ||
        existing.contentTypeId !== lessonData.contentTypeId ||
        existing.displayOrder !== lessonData.displayOrder;

      if (needsUpdate) {
        await db
          .update(lessons)
          .set(lessonData )
          .where(eq(lessons.id, existing.id));
        console.log(`  ↻ Updated lesson: ${lessonData.titleEn}`);
      }
      return existing;
    } else {
      try {
        const [newLesson] = await db.insert(lessons).values(lessonData ).returning();
        console.log(`  ✓ Created lesson: ${lessonData.titleEn}`);
        return newLesson;
      } catch (error: any) {
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(lessons)
            .where(
              and(
                eq(lessons.sectionId, lessonData.sectionId),
                eq(lessons.titleEn, lessonData.titleEn)
              )
            )
            .limit(1);
          
          if (existing) {
            await db
              .update(lessons)
              .set(lessonData )
              .where(eq(lessons.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  // Lesson templates
  const lessonTemplates = [
    {
      titleEn: 'Welcome and Course Overview',
      titleAr: 'مرحباً ونظرة عامة على الدورة',
      descriptionEn: 'Introduction to the course and what you will learn',
      descriptionAr: 'مقدمة للدورة وما ستتعلمه',
      contentTypeId: videoType?.id || defaultContentTypeId,
      contentEn: 'Welcome to this comprehensive course. In this lesson, we will cover...',
      contentAr: 'مرحباً بك في هذه الدورة الشاملة. في هذا الدرس، سنغطي...',
      videoUrl: 'https://example.com/videos/lesson-1.mp4',
      durationMinutes: 15,
      displayOrder: 1,
      isPreview: true,
    },
    {
      titleEn: 'Getting Started',
      titleAr: 'البدء',
      descriptionEn: 'Setting up your development environment',
      descriptionAr: 'إعداد بيئة التطوير الخاصة بك',
      contentTypeId: videoType?.id || defaultContentTypeId,
      contentEn: 'In this lesson, we will set up your development environment...',
      contentAr: 'في هذا الدرس، سنقوم بإعداد بيئة التطوير الخاصة بك...',
      videoUrl: 'https://example.com/videos/lesson-2.mp4',
      durationMinutes: 20,
      displayOrder: 2,
      isPreview: false,
    },
    {
      titleEn: 'Core Concepts',
      titleAr: 'المفاهيم الأساسية',
      descriptionEn: 'Understanding the fundamental concepts',
      descriptionAr: 'فهم المفاهيم الأساسية',
      contentTypeId: textType?.id || defaultContentTypeId,
      contentEn: 'The core concepts are essential to master...',
      contentAr: 'المفاهيم الأساسية ضرورية للإتقان...',
      durationMinutes: 25,
      displayOrder: 3,
      isPreview: false,
    },
    {
      titleEn: 'Practice Exercise',
      titleAr: 'تمرين عملي',
      descriptionEn: 'Hands-on practice with the concepts',
      descriptionAr: 'ممارسة عملية مع المفاهيم',
      contentTypeId: textType?.id || defaultContentTypeId,
      contentEn: 'Now it\'s time to practice what you\'ve learned...',
      contentAr: 'الآن حان الوقت لممارسة ما تعلمته...',
      durationMinutes: 30,
      displayOrder: 4,
      isPreview: false,
    },
    {
      titleEn: 'Knowledge Check Quiz',
      titleAr: 'اختبار التحقق من المعرفة',
      descriptionEn: 'Test your understanding with a quiz',
      descriptionAr: 'اختبر فهمك باختبار',
      contentTypeId: quizType?.id || defaultContentTypeId,
      contentEn: 'Complete this quiz to verify your understanding...',
      contentAr: 'أكمل هذا الاختبار للتحقق من فهمك...',
      durationMinutes: 15,
      displayOrder: 5,
      isPreview: false,
    },
  ];

  // Create lessons for each section
  for (const section of allSections) {
    const lessonsPerSection = Math.min(5, lessonTemplates.length);
    for (let i = 0; i < lessonsPerSection; i++) {
      const lessonData = {
        ...lessonTemplates[i],
        sectionId: section.id,
      };
      await upsertLesson(lessonData);
    }
  }

  console.log('✅ Course lessons seeded successfully!');
  await pool.end();
}
