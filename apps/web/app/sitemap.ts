import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo/config';
import { metadataAPI } from '@/lib/seo/metadata-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.siteUrl;
  const currentDate = new Date().toISOString();

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hub/social`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hub/jobs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hub/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hub/events`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hub/social/groups`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hub/users`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Fetch dynamic course pages
  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const courses = await metadataAPI.fetchAllCourses();
    coursePages = courses.map((course) => ({
      url: `${baseUrl}/hub/courses/${course.id}`,
      lastModified: course.updatedAt || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  // Fetch dynamic user profile pages (if public)
  let userPages: MetadataRoute.Sitemap = [];
  try {
    const users = await metadataAPI.fetchAllPublicUsers();
    userPages = users.map((user) => ({
      url: `${baseUrl}/hub/users/${user.id}`,
      lastModified: user.updatedAt || currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error fetching users for sitemap:', error);
  }

  return [...staticPages, ...coursePages, ...userPages];
}
