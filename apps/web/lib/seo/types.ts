import type { Metadata } from 'next';

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  defaultTitle: string;
  titleTemplate: string;
  twitterHandle: string;
  defaultImage: string;
  defaultKeywords: string[];
  organization: {
    name: string;
    url: string;
    logo: string;
    description: string;
    contactPoint?: {
      telephone?: string;
      contactType?: string;
      email?: string;
    };
  };
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  type?: 'website' | 'article' | 'profile' | 'video.other';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface CourseMetadata {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  currency?: string;
  instructor?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  duration?: number;
  level?: string;
  category?: string;
  updatedAt?: string;
}

export interface UserMetadata {
  id: number;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  role?: string;
  isInstructor?: boolean;
}

export interface LessonMetadata {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  courseTitle: string;
  videoUrl?: string;
  durationMinutes?: number;
  order?: number;
}

export interface GroupMetadata {
  id: number;
  name: string;
  description?: string;
  coverImage?: string;
  memberCount?: number;
  isPublic?: boolean;
}

// JSON-LD Schema Types
export interface JSONLDOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization' | 'EducationalOrganization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface JSONLDCourse {
  '@context': 'https://schema.org';
  '@type': 'Course';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization' | 'Person';
    name: string;
    url?: string;
  };
  courseCode?: string;
  instructor?: {
    '@type': 'Person';
    name: string;
    image?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  offers?: {
    '@type': 'Offer';
    price: number | string;
    priceCurrency: string;
    availability?: string;
    category?: string;
  };
  hasCourseInstance?: {
    '@type': 'CourseInstance';
    courseMode: string;
    duration?: string;
  };
  educationalLevel?: string;
  timeRequired?: string;
  image?: string;
}

export interface JSONLDPerson {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  description?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  url?: string;
}

export interface JSONLDBreadcrumb {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface JSONLDVideoObject {
  '@context': 'https://schema.org';
  '@type': 'VideoObject';
  name: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

export type JSONLDSchema =
  | JSONLDOrganization
  | JSONLDCourse
  | JSONLDPerson
  | JSONLDBreadcrumb
  | JSONLDVideoObject;
