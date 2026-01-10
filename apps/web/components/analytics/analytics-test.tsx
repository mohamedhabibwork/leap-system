'use client';

import { useState } from 'react';
import { logEvent, AnalyticsEvents } from '@/lib/firebase/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Analytics Test Component
 * 
 * Use this component to test that analytics is working correctly.
 * Add it to any page temporarily to verify events are being tracked.
 * 
 * Example usage:
 * import { AnalyticsTest } from '@/components/analytics/analytics-test';
 * 
 * export default function Page() {
 *   return (
 *     <div>
 *       <AnalyticsTest />
 *     </div>
 *   );
 * }
 * 
 * Then check:
 * 1. Browser Console for logged events
 * 2. Firebase Console → Analytics → Events
 * 3. Network tab for analytics requests
 */
export function AnalyticsTest() {
  const [lastEvent, setLastEvent] = useState<string>('None');

  const testCustomEvent = () => {
    const eventName = 'test_custom_event';
    logEvent(eventName, {
      test_property: 'test_value',
      timestamp: Date.now(),
    });
    setLastEvent(eventName);
    console.log('✅ Sent custom event:', eventName);
  };

  const testLoginEvent = () => {
    AnalyticsEvents.login('test');
    setLastEvent('login');
    console.log('✅ Sent login event');
  };

  const testCourseView = () => {
    AnalyticsEvents.viewCourse('test-course-123', 'Test Course');
    setLastEvent('view_course');
    console.log('✅ Sent course view event');
  };

  const testSearchEvent = () => {
    AnalyticsEvents.search('test search query', 'courses');
    setLastEvent('search');
    console.log('✅ Sent search event');
  };

  const testShareEvent = () => {
    AnalyticsEvents.shareContent('course', 'test-123');
    setLastEvent('share');
    console.log('✅ Sent share event');
  };

  const testMultipleEvents = () => {
    AnalyticsEvents.viewCourse('course-1', 'Course 1');
    AnalyticsEvents.viewCourse('course-2', 'Course 2');
    AnalyticsEvents.search('analytics test', 'all');
    logEvent('test_batch_event', { batch: true });
    setLastEvent('multiple_events');
    console.log('✅ Sent batch of events');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Analytics Test Component</CardTitle>
        <CardDescription>
          Click buttons to test analytics events. Check browser console and Firebase Console to verify.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={testCustomEvent} variant="outline">
            Test Custom Event
          </Button>
          <Button onClick={testLoginEvent} variant="outline">
            Test Login Event
          </Button>
          <Button onClick={testCourseView} variant="outline">
            Test Course View
          </Button>
          <Button onClick={testSearchEvent} variant="outline">
            Test Search Event
          </Button>
          <Button onClick={testShareEvent} variant="outline">
            Test Share Event
          </Button>
          <Button onClick={testMultipleEvents} variant="outline">
            Test Multiple Events
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Last Event Sent:</p>
          <p className="text-lg font-bold text-primary mt-1">{lastEvent}</p>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Verification Steps:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open Browser DevTools → Console</li>
            <li>Click any button above</li>
            <li>Look for "✅ Sent [event name]" in console</li>
            <li>Check DevTools → Network tab for analytics requests</li>
            <li>Go to Firebase Console → Analytics → Events</li>
            <li>Look for events: test_custom_event, login, view_item, search, share</li>
          </ol>
        </div>

        <div className="mt-4 p-4 border border-amber-500/50 bg-amber-500/10 rounded-lg">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            ⚠️ Remember to remove this component from your page after testing!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Web Vitals Display Component
 * Shows the current Web Vitals metrics in real-time
 */
export function WebVitalsDisplay() {
  const [metrics, setMetrics] = useState<Record<string, any>>({});

  // Listen for web-vitals-reported custom event
  if (typeof window !== 'undefined') {
    window.addEventListener('web-vitals-reported', ((event: CustomEvent) => {
      const metric = event.detail;
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric,
      }));
    }) as EventListener);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Web Vitals Monitor</CardTitle>
        <CardDescription>
          Real-time Core Web Vitals metrics for the current page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['FCP', 'LCP', 'CLS', 'FID', 'TTFB', 'INP'].map((metricName) => {
            const metric = metrics[metricName];
            const value = metric?.value;
            const rating = metric?.rating;
            
            return (
              <div
                key={metricName}
                className="p-4 border rounded-lg bg-card"
              >
                <p className="text-xs font-medium text-muted-foreground">{metricName}</p>
                <p className="text-2xl font-bold mt-1">
                  {value != null 
                    ? metricName === 'CLS' 
                      ? value.toFixed(3)
                      : `${Math.round(value)}ms`
                    : '—'
                  }
                </p>
                {rating && (
                  <p className={`text-xs mt-1 font-medium ${
                    rating === 'good' ? 'text-green-600' :
                    rating === 'needs-improvement' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {rating}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Metrics appear as they are measured. Some metrics may take a few seconds to appear.
        </p>
      </CardContent>
    </Card>
  );
}
