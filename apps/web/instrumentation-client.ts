/**
 * Client-side instrumentation
 * This file runs before the application's frontend code starts executing
 * Ideal for setting up global analytics, error tracking, or performance monitoring
 */

// Initialize analytics before the app starts
if (typeof window !== 'undefined') {
  console.log('[Instrumentation] Analytics and monitoring initialized');

  // Set up global error tracking
  window.addEventListener('error', (event) => {
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
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      console.log('[Performance] Page Load Metrics', {
        pageLoadTime: `${pageLoadTime}ms`,
        domContentLoadedTime: `${domContentLoadedTime}ms`,
        dnsTime: `${timing.domainLookupEnd - timing.domainLookupStart}ms`,
        tcpTime: `${timing.connectEnd - timing.connectStart}ms`,
        ttfb: `${timing.responseStart - timing.navigationStart}ms`,
      });
    });
  }
}
