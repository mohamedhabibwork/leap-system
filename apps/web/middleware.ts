import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

// Premium routes that require subscription
const PREMIUM_ROUTES = ['/premium', '/advanced-features'];

/**
 * Extract course ID from path
 */
function extractCourseId(pathname: string): number | null {
  const match = pathname.match(/\/courses\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if user has access to a course
 * This is a simplified check - in production, you'd call the API
 */
async function checkCourseAccess(
  userId: number,
  courseId: number,
  accessToken: string,
): Promise<boolean> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${API_URL}/api/v1/lms/courses/${courseId}/access-status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data.hasAccess === true;
    }

    return false;
  } catch (error) {
    console.error('Error checking course access:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Exclude static files, API routes, and Next.js internals
  if (
    pathname === '/manifest.json' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|txt|xml|json|png|jpg|jpeg|svg|gif|webp)$/i)
  ) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if accessing course learning content
  if (pathname.includes('/courses/') && pathname.includes('/learn')) {
    if (!token) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const courseId = extractCourseId(pathname);
    if (courseId && token.accessToken) {
      const hasAccess = await checkCourseAccess(
        (token.id || token.sub) as number,
        courseId,
        token.accessToken as string,
      );

      if (!hasAccess) {
        // Redirect to course detail page with error
        const courseUrl = new URL(
          pathname.replace('/learn', ''),
          request.url,
        );
        courseUrl.searchParams.set('error', 'no_access');
        return NextResponse.redirect(courseUrl);
      }
    }
  }

  // Check subscription for premium features
  if (PREMIUM_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has active subscription
    // This is a simplified check - in production, verify with API
    const hasSubscription =
      token.subscriptionStatus === 'active' &&
      (!token.subscriptionExpiresAt ||
        new Date(token.subscriptionExpiresAt as string) > new Date());

    if (!hasSubscription) {
      const pricingUrl = new URL('/pricing', request.url);
      pricingUrl.searchParams.set('error', 'subscription_required');
      return NextResponse.redirect(pricingUrl);
    }
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match paths starting with /en or /ar (locales)
    '/(en|ar)/:path*',
    // Also match root path to redirect to default locale
    '/',
    // Course learning paths
    '/(en|ar)/hub/courses/:path*/learn',
    // Premium routes
    '/(en|ar)/premium/:path*',
  ],
};
