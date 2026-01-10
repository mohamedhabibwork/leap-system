import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Exclude manifest.json and other metadata files from i18n processing
  const pathname = request.nextUrl.pathname;
  
  // Skip i18n middleware for manifest.json and other static/metadata files
  if (
    pathname === '/manifest.json' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|txt|xml|json|png|jpg|jpeg|svg|gif|webp)$/i) // Exclude files with extensions
  ) {
    // Return undefined to let Next.js handle the request normally
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  // Only match paths that start with a locale (en or ar)
  // This excludes manifest.json, robots.txt, sitemap.xml, and other root-level files
  matcher: [
    // Match paths starting with /en or /ar (locales)
    // Exclude everything else (api, _next, static files, manifest.json, etc.)
    '/(en|ar)/:path*',
    // Also match root path to redirect to default locale
    '/',
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
  ]
};
