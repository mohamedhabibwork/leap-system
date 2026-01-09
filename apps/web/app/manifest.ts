import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: 'LEAP PM',
    description: seoConfig.siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/images/seo/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/images/seo/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['education', 'learning', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  };
}
