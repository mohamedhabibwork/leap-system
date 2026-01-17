import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo/config';
import { isPWAEnabled } from '@/lib/utils/pwa';

export default function manifest(): MetadataRoute.Manifest | null {
  // Return null if PWA is disabled (Next.js will handle this gracefully)
  if (!isPWAEnabled()) {
    return null;
  }
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
        src: '/images/seo/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/images/seo/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/images/seo/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
        purpose: 'any',
      },
    ],
    categories: ['education', 'learning', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    shortcuts: [
      {
        name: 'Courses',
        short_name: 'Courses',
        description: 'Browse available courses',
        url: '/hub/courses',
        icons: [{ src: '/images/seo/icon-192.svg', sizes: '192x192' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Go to your dashboard',
        url: '/hub',
        icons: [{ src: '/images/seo/icon-192.svg', sizes: '192x192' }],
      },
    ],
    screenshots: [],
    related_applications: [],
    prefer_related_applications: false,
  };
}
