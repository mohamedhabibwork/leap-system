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
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/utils/query-client';
import { coursesAPI, sectionsAPI } from '@/lib/api/courses';
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
  const queryClient = getQueryClient();

  // Prefetch course data in parallel for better performance
  // Using allSettled to prevent one failure from blocking others
  const prefetchResults = await Promise.allSettled([
    // Prefetch course
    queryClient.prefetchQuery({
      queryKey: ['courses', courseId],
      queryFn: async () => {
        try {
          const course = await coursesAPI.getById(courseId);
          return course ?? null;
        } catch (error) {
          console.error('Error prefetching course:', error);
          return null;
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
    // Prefetch course lessons
    queryClient.prefetchQuery({
      queryKey: ['courses', courseId, 'lessons'],
      queryFn: async () => {
        try {
          const lessons = await coursesAPI.getLessons(courseId);
          return Array.isArray(lessons) ? lessons : [];
        } catch (error) {
          console.error('Error prefetching lessons:', error);
          return [];
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
    // Prefetch course sections (needed for curriculum)
    queryClient.prefetchQuery({
      queryKey: ['sections', courseId],
      queryFn: async () => {
        try {
          const sections = await sectionsAPI.getByCourse(courseId);
          return Array.isArray(sections) ? sections : [];
        } catch (error) {
          console.error('Error prefetching sections:', error);
          return [];
        }
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
    // Prefetch course reviews (less critical, can fail silently)
    queryClient.prefetchQuery({
      queryKey: ['courses', courseId, 'reviews'],
      queryFn: async () => {
        try {
          const reviews = await coursesAPI.getReviews(courseId);
          return Array.isArray(reviews) ? reviews : [];
        } catch (error) {
          console.error('Error prefetching reviews:', error);
          return [];
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes (reviews change less frequently)
    }),
  ]);

  // Log any failures for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    prefetchResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Prefetch ${index} failed:`, result.reason);
      }
    });
  }

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
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
}
