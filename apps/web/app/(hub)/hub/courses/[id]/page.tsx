import type { Metadata } from 'next';
import { metadataAPI } from '@/lib/seo/metadata-api';
import {
  generateDynamicMetadata,
  generateCourseSchema,
  formatJsonLd,
  generateBreadcrumbSchema,
  truncateDescription,
} from '@/lib/seo/utils';
import { seoConfig } from '@/lib/seo/config';
import CourseDetailClient from './course-detail-client';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const courseId = parseInt(id);

  // Fetch course metadata
  const course = await metadataAPI.fetchCourseMetadata(courseId);

  if (!course) {
    return generateDynamicMetadata(
      'Course Not Found',
      'The requested course could not be found.',
      {
        canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}`,
      }
    );
  }

  const instructorName = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`
    : 'LEAP PM';

  const title = `${course.title} | Learn with ${instructorName}`;
  const description = truncateDescription(
    course.description ||
      `Enroll in ${course.title} on LEAP PM. ${
        course.level ? `Level: ${course.level}.` : ''
      } ${course.enrollmentCount ? `Join ${course.enrollmentCount}+ students.` : ''}`
  );

  return generateDynamicMetadata(title, description, {
    image: course.thumbnail,
    canonical: `${seoConfig.siteUrl}/hub/courses/${courseId}`,
    keywords: [
      course.title,
      course.category || 'online course',
      course.level || 'all levels',
      'e-learning',
      'online education',
      ...(course.instructor
        ? [`${course.instructor.firstName} ${course.instructor.lastName}`]
        : []),
    ],
    type: 'article',
    publishedTime: course.updatedAt,
    modifiedTime: course.updatedAt,
  });
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const courseId = parseInt(id);

  // Fetch course metadata for JSON-LD schema
  const course = await metadataAPI.fetchCourseMetadata(courseId);

  // Generate structured data if course exists
  let courseSchema = null;
  let breadcrumbSchema = null;

  if (course) {
    courseSchema = generateCourseSchema(course);
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Courses', url: `${seoConfig.siteUrl}/hub/courses` },
      { name: course.title, url: `${seoConfig.siteUrl}/hub/courses/${courseId}` },
    ]);
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      {courseSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(courseSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(breadcrumbSchema) }}
        />
      )}

      {/* Client Component */}
      <CourseDetailClient params={Promise.resolve({ id })} />
    </>
  );
}
