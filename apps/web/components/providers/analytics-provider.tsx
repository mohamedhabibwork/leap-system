'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logPageView } from '@/lib/firebase/analytics';

/**
 * AnalyticsProvider component for automatic page view tracking
 * Tracks route changes and logs page views to Firebase Analytics
 * All analytics calls are wrapped in try-catch for error safety
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // Skip if running on server
      if (typeof window === 'undefined') {
        return;
      }

      // Get the full URL including search params
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      // Extract page name from pathname for better readability in analytics
      const pageName = pathname
        .split('/')
        .filter(Boolean)
        .map(segment => {
          // Convert kebab-case to Title Case and handle dynamic routes
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return 'Dynamic';
          }
          return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        })
        .join(' > ') || 'Home';

      // Log page view with additional context
      logPageView(pageName, {
        page_path: pathname,
        page_url: url,
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.warn('[AnalyticsProvider] Error tracking page view:', error);
    }
  }, [pathname, searchParams]);

  // This component doesn't render anything, it just tracks page views
  return <>{children}</>;
}
