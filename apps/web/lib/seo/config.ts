import type { SEOConfig } from './types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'LEAP PM';
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@leappm';

export const seoConfig: SEOConfig = {
  siteName,
  siteUrl,
  siteDescription:
    'LEAP PM - The most comprehensive Learning Management System for modern education. Create, manage, and scale your online learning platform with courses, social learning, certifications, and more.',
  defaultTitle: 'LEAP PM - Modern Learning Management System',
  titleTemplate: '%s | LEAP PM',
  twitterHandle,
  defaultImage: `${siteUrl}/images/seo/og-default.svg`,
  defaultKeywords: [
    'LMS',
    'Learning Management System',
    'Online Learning',
    'E-Learning',
    'Education Platform',
    'Online Courses',
    'Course Management',
    'Student Portal',
    'Instructor Platform',
    'Educational Technology',
  ],
  organization: {
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/seo/logo.svg`,
    description:
      'LEAP PM provides a comprehensive platform for online education with course management, social learning, certifications, and analytics.',
    contactPoint: {
      contactType: 'Customer Service',
      email: 'support@leappm.com',
    },
  },
};

// Section-specific keywords
export const sectionKeywords = {
  auth: ['login', 'register', 'sign up', 'account', 'authentication'],
  courses: [
    'online courses',
    'learn online',
    'course catalog',
    'training',
    'education',
    'skill development',
  ],
  instructor: [
    'teach online',
    'instructor dashboard',
    'create courses',
    'manage students',
    'teaching analytics',
  ],
  social: [
    'learning community',
    'student network',
    'discussion groups',
    'social learning',
    'peer collaboration',
  ],
  events: ['webinars', 'live sessions', 'workshops', 'training events'],
  jobs: ['job board', 'career opportunities', 'employment', 'hiring'],
  admin: ['administration', 'system management', 'admin panel'],
};

// Default metadata for different page sections
export const sectionDefaults = {
  auth: {
    description: 'Access your LEAP PM account to continue your learning journey.',
    keywords: [...seoConfig.defaultKeywords, ...sectionKeywords.auth],
  },
  courses: {
    description:
      'Browse our comprehensive catalog of online courses. Learn new skills from expert instructors.',
    keywords: [...seoConfig.defaultKeywords, ...sectionKeywords.courses],
  },
  instructor: {
    description:
      'Manage your courses, students, and teaching analytics on the LEAP PM instructor platform.',
    keywords: [...seoConfig.defaultKeywords, ...sectionKeywords.instructor],
  },
  social: {
    description:
      'Connect with fellow learners, join discussion groups, and collaborate in the LEAP PM community.',
    keywords: [...seoConfig.defaultKeywords, ...sectionKeywords.social],
  },
  admin: {
    description: 'LEAP PM administration panel.',
    keywords: [...seoConfig.defaultKeywords, ...sectionKeywords.admin],
    noindex: true,
  },
};
