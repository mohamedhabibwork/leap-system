'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect, useRef } from 'react';
import { logEvent } from '@/lib/firebase/analytics';

/**
 * WebVitals component for tracking Next.js performance metrics
 * Tracks: TTFB, FCP, LCP, FID, CLS, INP
 * Integrates with Firebase Analytics for centralized reporting
 */
export function WebVitals() {
  const reportedMetrics = useRef<Set<string>>(new Set());

  useReportWebVitals((metric) => {
    // Avoid duplicate reporting for the same metric
    const metricKey = `${metric.name}-${metric.id}`;
    if (reportedMetrics.current.has(metricKey)) {
      return;
    }
    reportedMetrics.current.add(metricKey);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    }

    // Send to Firebase Analytics
    try {
      logEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_id: metric.id,
        metric_navigation_type: metric.navigationType,
      });

      // Send individual metric events for better filtering
      switch (metric.name) {
        case 'FCP':
          // First Contentful Paint
          logEvent('web_vitals_fcp', {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
          break;
        case 'LCP':
          // Largest Contentful Paint
          logEvent('web_vitals_lcp', {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
          break;
        case 'CLS':
          // Cumulative Layout Shift
          logEvent('web_vitals_cls', {
            value: Math.round(metric.value * 1000), // CLS values are small, multiply for better precision
            rating: metric.rating,
          });
          break;
        case 'FID':
          // First Input Delay
          logEvent('web_vitals_fid', {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
          break;
        case 'TTFB':
          // Time to First Byte
          logEvent('web_vitals_ttfb', {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
          break;
        case 'INP':
          // Interaction to Next Paint
          logEvent('web_vitals_inp', {
            value: Math.round(metric.value),
            rating: metric.rating,
          });
          break;
      }
    } catch (error) {
      console.warn('[Web Vitals] Error reporting metric:', error);
    }

    // Send to external analytics service if configured
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      sendToExternalAnalytics(metric);
    }
  });

  // Send to Google Analytics if configured
  useEffect(() => {
    // Check if gtag is available (Google Analytics)
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('[Web Vitals] Google Analytics integration enabled');
    }
  }, []);

  return null;
}

/**
 * Send metrics to external analytics endpoint
 */
function sendToExternalAnalytics(metric: any) {
  try {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    });

    const url = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (!url) return;

    // Use sendBeacon for reliability, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        body,
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.warn('[Web Vitals] Error sending to external analytics:', error);
      });
    }
  } catch (error) {
    console.warn('[Web Vitals] Error preparing external analytics:', error);
  }
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
