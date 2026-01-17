import type { Metadata } from 'next';
import { metadataAPI } from '@/lib/seo/metadata-api';
import {
  generateDynamicMetadata,
  generateBreadcrumbSchema,
  generateVideoSchema,
  formatJsonLd,
} from '@/lib/seo/utils';
import { seoConfig } from '@/lib/seo/config';
import LessonLearningClient from './lesson-learning-client';

type Props = {
  params: Promise<{ id: string; sectionId: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, sectionId, lessonId } = await params;
  const courseId = parseInt(id);
  const lessonIdNum = parseInt(lessonId);

    const lesson = await metadataAPI.fetchLessonMetadata(courseId, lessonIdNum);
    if (!lesson) {
      return generateDynamicMetadata('Lesson Not Found', 'The requested lesson could not be found.', {
        type: 'website',
        canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        keywords: ['Lesson Not Found', 'Course Lesson', 'Online Learning'],
      });
    }

    return generateDynamicMetadata(`${lesson.title} | ${lesson.courseTitle}`, lesson.description || `Learn ${lesson.title} in ${lesson.courseTitle}`, {
      canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      keywords: [lesson.title, lesson.courseTitle, 'online course', 'learning'],
    });
}

export default async function LessonLearningPage({ params }: Props) {
  const { id, sectionId, lessonId } = await params;
  const courseId = parseInt(id);
  const sectionIdNum = parseInt(sectionId);
  const lessonIdNum = parseInt(lessonId);

  // Fetch lesson metadata for JSON-LD schema
  const lesson = await metadataAPI.fetchLessonMetadata(courseId, lessonIdNum);

  // Generate structured data if lesson exists
  let breadcrumbSchema = null;
  let videoSchema = null;

  if (lesson) {
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Courses', url: `${seoConfig.siteUrl}/hub/courses` },
      {
        name: lesson.courseTitle,
        url: `${seoConfig.siteUrl}/hub/courses/${courseId}`,
      },
      {
        name: 'Learn',
        url: `${seoConfig.siteUrl}/hub/courses/${courseId}/learn`,
      },
      {
        name: lesson.title,
        url: `${seoConfig.siteUrl}/hub/courses/${courseId}/sections/${sectionIdNum}/lessons/${lessonIdNum}`,
      },
    ]);

    if (lesson.videoUrl) {
      videoSchema = generateVideoSchema(lesson);
    }
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(breadcrumbSchema) }}
        />
      )}
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(videoSchema) }}
        />
      )}

      {/* Client Component */}
      <LessonLearningClient params={Promise.resolve({ id, sectionId, lessonId })} />
    </>
  );
}
