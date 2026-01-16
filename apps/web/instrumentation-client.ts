/**
 * Client-side instrumentation
 * This file runs before the application's frontend code starts executing
 * Ideal for setting up global analytics, error tracking, or performance monitoring
 */

// Initialize analytics before the app starts
if (typeof window !== 'undefined') {
  console.log('[Instrumentation] Analytics and monitoring initialized');

  // Suppress Next.js performance measurement errors
  // This is a known bug in Next.js dev mode (GitHub Issue #86060)
  // where performance.measure() is called with invalid timestamps for not-found pages
  if (window.performance && window.performance.measure) {
    const originalMeasure = window.performance.measure.bind(window.performance);
    window.performance.measure = function(...args: any[]) {
      try {
        return originalMeasure(...args);
      } catch (error: any) {
        // Suppress the "cannot have a negative time stamp" error
        // This is a known Next.js bug in development mode
        if (
          error?.message?.includes('cannot have a negative time stamp') ||
          error?.message?.includes('RootNotFound') ||
          error?.message?.includes('NotFound')
        ) {
          // Silently ignore this known Next.js bug
          return;
        }
        // Re-throw other performance errors
        throw error;
      }
    };
  }

  // Set up global error tracking
  window.addEventListener('error', (event) => {
    // Suppress the known Next.js performance measurement error
    if (
      event.error?.message?.includes('cannot have a negative time stamp') ||
      event.error?.message?.includes('RootNotFound') ||
      event.error?.message?.includes('Failed to execute \'measure\' on \'Performance\'')
    ) {
      // Silently ignore this known Next.js bug
      event.preventDefault();
      return;
    }

    // Send to your error tracking service
    console.error('[Global Error Handler]', {
      message: event.error?.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    
    // You can integrate with services like Sentry here
    // reportError(event.error);
  });

  // Set up global unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress the known Next.js performance measurement error
    if (
      event.reason?.message?.includes('cannot have a negative time stamp') ||
      event.reason?.message?.includes('RootNotFound') ||
      event.reason?.message?.includes('Failed to execute \'measure\' on \'Performance\'')
    ) {
      // Silently ignore this known Next.js bug
      event.preventDefault();
      return;
    }

    console.error('[Unhandled Promise Rejection]', {
      reason: event.reason,
      promise: event.promise,
    });
    
    // You can integrate with services like Sentry here
    // reportError(event.reason);
  });

  // Log initial page load performance
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      try {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        // Only log if values are valid (non-negative)
        if (pageLoadTime >= 0 && domContentLoadedTime >= 0) {
          console.log('[Performance] Page Load Metrics', {
            pageLoadTime: `${pageLoadTime}ms`,
            domContentLoadedTime: `${domContentLoadedTime}ms`,
            dnsTime: `${timing.domainLookupEnd - timing.domainLookupStart}ms`,
            tcpTime: `${timing.connectEnd - timing.connectStart}ms`,
            ttfb: `${timing.responseStart - timing.navigationStart}ms`,
          });
        }
      } catch (error) {
        // Silently ignore performance timing errors
        // This can happen in development mode with Next.js
      }
    });
  }
}
