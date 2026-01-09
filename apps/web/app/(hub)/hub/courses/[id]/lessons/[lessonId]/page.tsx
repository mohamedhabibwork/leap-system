import type { Metadata } from 'next';
import { metadataAPI } from '@/lib/seo/metadata-api';
import {
  generateDynamicMetadata,
  generateBreadcrumbSchema,
  generateVideoSchema,
  formatJsonLd,
  truncateDescription,
} from '@/lib/seo/utils';
import { seoConfig } from '@/lib/seo/config';
import LessonClient from './lesson-client';

type Props = {
  params: Promise<{ id: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lessonId } = await params;
  const courseId = parseInt(id);
  const lessonIdNum = parseInt(lessonId);

  // Fetch lesson metadata
  const lesson = await metadataAPI.fetchLessonMetadata(courseId, lessonIdNum);

  if (!lesson) {
    return generateDynamicMetadata(
      'Lesson Not Found',
      'The requested lesson could not be found.',
      {
        canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}/lessons/${lessonIdNum}`,
      }
    );
  }

  const title = `${lesson.title} | ${lesson.courseTitle}`;
  const description = truncateDescription(
    lesson.description ||
      `Learn ${lesson.title} in the ${lesson.courseTitle} course on LEAP PM.`
  );

  return generateDynamicMetadata(title, description, {
    canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}/lessons/${lessonIdNum}`,
    keywords: [
      lesson.title,
      lesson.courseTitle,
      'online lesson',
      'e-learning',
      'course content',
    ],
    type: lesson.videoUrl ? 'video.other' : 'article',
  });
}

export default async function LessonPage({ params }: Props) {
  const { id, lessonId } = await params;
  const courseId = parseInt(id);
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
        name: lesson.title,
        url: `${seoConfig.siteUrl}/hub/courses/${courseId}/lessons/${lessonIdNum}`,
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
      <LessonClient params={Promise.resolve({ id, lessonId })} />
    </>
  );
}
