/**
 * Google Analytics Integration (Optional)
 * 
 * To use this:
 * 1. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your .env.local
 * 2. Add Google Analytics scripts to your layout (see example below)
 * 3. Import and use these functions for custom event tracking
 */

// Type definitions for gtag
type GtagCommand = 'config' | 'event' | 'set';
type GtagFunction = {
  (command: 'config', targetId: string, config?: Record<string, any>): void;
  (command: 'event', eventName: string, params?: Record<string, any>): void;
  (command: 'set', targetId: string, config?: Record<string, any>): void;
};

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: any[];
  }
}

/**
 * Initialize Google Analytics
 * Call this in your layout after the gtag script loads
 */
export const initGA = () => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.warn('[GA] Measurement ID not configured');
    return;
  }

  try {
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
    });
    console.log('[GA] Initialized with ID:', measurementId);
  } catch (error) {
    console.warn('[GA] Error initializing:', error);
  }
};

/**
 * Track a page view in Google Analytics
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  try {
    window.gtag('config', measurementId, {
      page_path: url,
    });
  } catch (error) {
    console.warn('[GA] Error tracking page view:', error);
  }
};

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', eventName, params);
  } catch (error) {
    console.warn('[GA] Error tracking event:', error);
  }
};

/**
 * Track Web Vitals in Google Analytics
 * This is automatically called by the WebVitals component if gtag is available
 */
export const trackWebVital = (metric: {
  name: string;
  value: number;
  id: string;
  rating?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      event_category: 'Web Vitals',
      non_interaction: true,
      metric_rating: metric.rating,
    });
  } catch (error) {
    console.warn('[GA] Error tracking web vital:', error);
  }
};

/**
 * Common Google Analytics events
 */
export const GAEvents = {
  // E-commerce events
  viewItem: (itemId: string, itemName: string, category: string, value?: number) =>
    trackEvent('view_item', {
      item_id: itemId,
      item_name: itemName,
      item_category: category,
      value,
    }),

  selectContent: (contentType: string, itemId: string) =>
    trackEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
    }),

  // User engagement
  share: (contentType: string, itemId: string, method?: string) =>
    trackEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    }),

  search: (searchTerm: string, category?: string) =>
    trackEvent('search', {
      search_term: searchTerm,
      category,
    }),

  // Conversion events
  signUp: (method: string) =>
    trackEvent('sign_up', { method }),

  login: (method: string) =>
    trackEvent('login', { method }),

  // Custom events
  clickButton: (buttonName: string, location: string) =>
    trackEvent('click_button', {
      button_name: buttonName,
      location,
    }),

  videoPlay: (videoId: string, videoTitle: string) =>
    trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle,
    }),

  fileDownload: (fileName: string, fileType: string) =>
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
    }),
};

/**
 * Set user properties in Google Analytics
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('set', 'user_properties', properties);
  } catch (error) {
    console.warn('[GA] Error setting user properties:', error);
  }
};

/**
 * Example: Add to your root layout
 * 
 * ```tsx
 * import Script from 'next/script';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <Script
 *           strategy="afterInteractive"
 *           src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
 *         />
 *         <Script
 *           id="google-analytics"
 *           strategy="afterInteractive"
 *           dangerouslySetInnerHTML={{
 *             __html: `
 *               window.dataLayer = window.dataLayer || [];
 *               function gtag(){dataLayer.push(arguments);}
 *               gtag('js', new Date());
 *               gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
 *                 page_path: window.location.pathname,
 *               });
 *             `,
 *           }}
 *         />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * Example: Track page views on route changes
 * 
 * ```tsx
 * 'use client';
 * 
 * import { usePathname, useSearchParams } from 'next/navigation';
 * import { useEffect } from 'react';
 * import { trackPageView } from '@/lib/analytics/google-analytics';
 * 
 * export function GAPageViewTracker() {
 *   const pathname = usePathname();
 *   const searchParams = useSearchParams();
 * 
 *   useEffect(() => {
 *     const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
 *     trackPageView(url);
 *   }, [pathname, searchParams]);
 * 
 *   return null;
 * }
 * ```
 */
