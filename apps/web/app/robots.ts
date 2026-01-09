import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production';
  const siteUrl = seoConfig.siteUrl;

  // Block all crawlers in non-production environments
  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/hub/chat/*',
          '/hub/ads/new',
          '/hub/ads/*/analytics',
          '/hub/instructor/*/edit',
          '/hub/courses/*/edit',
          '/*?*', // Disallow URLs with query parameters (avoid duplicate content)
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Block OpenAI crawler if desired
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
