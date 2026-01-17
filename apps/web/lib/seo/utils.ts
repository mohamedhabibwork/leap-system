import type { Metadata } from 'next';
import { seoConfig, sectionDefaults } from './config';
import type {
  PageMetadata,
  BreadcrumbItem,
  JSONLDOrganization,
  JSONLDCourse,
  JSONLDPerson,
  JSONLDBreadcrumb,
  JSONLDVideoObject,
  CourseMetadata,
  UserMetadata,
  LessonMetadata,
} from './types';

/**
 * Generate Next.js metadata object from page metadata
 */
export function generateMetadata(pageMetadata: PageMetadata): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    canonical,
    noindex = false,
    nofollow = false,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
  } = pageMetadata;

  const fullTitle = (typeof title === 'string' && title.includes('|')) 
    ? title 
    : `${title || seoConfig.siteName} | ${seoConfig.siteName}`;
  const ogImage = image || seoConfig.defaultImage;
  const url = canonical || seoConfig.siteUrl;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords || seoConfig.defaultKeywords,
    authors: author ? [{ name: author }] : undefined,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: seoConfig.siteName,
      locale: 'en_US',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && type === 'article' && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };

  return metadata;
}

/**
 * Generate metadata for static pages by section
 */
export function generatePageMetadata(
  title: string,
  description?: string,
  options?: {
    section?: keyof typeof sectionDefaults;
    keywords?: string[];
    image?: string;
    noindex?: boolean;
    type?: 'website' | 'article' | 'profile';
  }
): Metadata {
  const section = options?.section;
  const sectionDefault = section ? sectionDefaults[section] : null;

  const pageMetadata: PageMetadata = {
    title,
    description: description || sectionDefault?.description || seoConfig.siteDescription,
    keywords: options?.keywords || sectionDefault?.keywords || seoConfig.defaultKeywords,
    image: options?.image,
    noindex: options?.noindex ?? sectionDefault?.noindex ?? false,
    type: options?.type || 'website',
  };

  return generateMetadata(pageMetadata);
}

/**
 * Generate metadata for dynamic pages with IDs
 */
export function generateDynamicMetadata(
  title: string,
  description: string,
  options?: {
    image?: string;
    canonical?: string;
    keywords?: string[];
    type?: 'website' | 'article' | 'profile' | 'video.other';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
  }
): Metadata {
  const pageMetadata: PageMetadata = {
    title,
    description,
    image: options?.image,
    canonical: options?.canonical,
    keywords: options?.keywords || seoConfig.defaultKeywords,
    type: options?.type || 'website',
    author: options?.author,
    publishedTime: options?.publishedTime,
    modifiedTime: options?.modifiedTime,
  };

  return generateMetadata(pageMetadata);
}

/**
 * Generate JSON-LD Organization schema
 */
export function generateOrganizationSchema(): JSONLDOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: seoConfig.organization.name,
    url: seoConfig.organization.url,
    logo: seoConfig.organization.logo,
    description: seoConfig.organization.description,
    ...(seoConfig.organization.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...seoConfig.organization.contactPoint,
      },
    }),
  };
}

/**
 * Generate JSON-LD Breadcrumb schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): JSONLDBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(index < items.length - 1 && { item: item.url }),
    })),
  };
}

/**
 * Generate JSON-LD Course schema
 */
export function generateCourseSchema(course: CourseMetadata): JSONLDCourse {
  const schema: JSONLDCourse = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
    ...(course.thumbnail && { image: course.thumbnail }),
    ...(course.level && { educationalLevel: course.level }),
    ...(course.duration && {
      timeRequired: `PT${course.duration}H`,
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        duration: `PT${course.duration}H`,
      },
    }),
  };

  // Add instructor
  if (course.instructor) {
    schema.instructor = {
      '@type': 'Person',
      name: `${course.instructor.firstName} ${course.instructor.lastName}`,
      ...(course.instructor.avatar && { image: course.instructor.avatar }),
    };
  }

  // Add rating
  if (course.rating && course.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add pricing
  if (course.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: course.price === 0 ? '0' : course.price,
      priceCurrency: course.currency || 'USD',
      availability: 'https://schema.org/InStock',
      ...(course.category && { category: course.category }),
    };
  }

  return schema;
}

/**
 * Generate JSON-LD Person schema
 */
export function generatePersonSchema(user: UserMetadata): JSONLDPerson {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${user.firstName} ${user.lastName}`,
    ...(user.bio && { description: user.bio }),
    ...(user.avatar && { image: user.avatar }),
    ...(user.role && { jobTitle: user.role }),
    ...(user.isInstructor && {
      worksFor: {
        '@type': 'Organization',
        name: seoConfig.siteName,
      },
    }),
    url: `${seoConfig.siteUrl}/hub/users/${user.id}`,
  };
}

/**
 * Generate JSON-LD VideoObject schema
 */
export function generateVideoSchema(lesson: LessonMetadata): JSONLDVideoObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: lesson.title,
    ...(lesson.description && { description: lesson.description }),
    ...(lesson.videoUrl && {
      contentUrl: lesson.videoUrl,
      embedUrl: lesson.videoUrl,
    }),
    ...(lesson.durationMinutes && {
      duration: `PT${lesson.durationMinutes}M`,
    }),
  };
}

/**
 * Format JSON-LD schema for embedding in HTML
 */
export function formatJsonLd(schema: unknown): string {
  return JSON.stringify(schema, null, 0);
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
}

/**
 * Truncate text for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, baseKeywords: string[] = []): string[] {
  // Simple keyword extraction - in production, you might want more sophisticated NLP
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'may',
    'might',
    'can',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  const uniqueWords = Array.from(new Set(words)).slice(0, 5);
  return [...new Set([...baseKeywords, ...uniqueWords])];
}
