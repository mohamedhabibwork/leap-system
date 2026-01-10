# Analytics Implementation Guide

This document describes the analytics implementation in the Next.js application, including Web Vitals tracking and Firebase Analytics integration.

## Overview

The application uses a dual analytics approach:

1. **Next.js Web Vitals** - Built-in performance monitoring for Core Web Vitals
2. **Firebase Analytics** - Custom event tracking and user analytics

## Components

### 1. Client Instrumentation (`instrumentation-client.ts`)

Located at the root of the web app, this file runs before your application's frontend code starts executing. It sets up:

- Global error tracking
- Unhandled promise rejection handling
- Initial page load performance monitoring

```typescript
// Located at: apps/web/instrumentation-client.ts
```

**Features:**
- Runs before app initialization
- Tracks global errors and unhandled promise rejections
- Logs performance metrics (page load time, DNS time, TTFB, etc.)
- Can be integrated with error tracking services like Sentry

### 2. Web Vitals Component (`components/analytics/web-vitals.tsx`)

A client component that tracks Core Web Vitals using Next.js's `useReportWebVitals` hook.

**Tracked Metrics:**
- **TTFB** (Time to First Byte) - Server response time
- **FCP** (First Contentful Paint) - When first content is painted
- **LCP** (Largest Contentful Paint) - When largest content is painted
- **FID** (First Input Delay) - Time until page becomes interactive
- **CLS** (Cumulative Layout Shift) - Visual stability metric
- **INP** (Interaction to Next Paint) - Responsiveness metric

**Integration:**
- Automatically sends metrics to Firebase Analytics
- Supports external analytics endpoints via `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
- Includes Google Analytics integration support
- Prevents duplicate metric reporting

### 3. Firebase Analytics (`lib/firebase/analytics.ts`)

Custom event tracking for user interactions throughout the app.

**Available Event Categories:**

#### Authentication Events
```typescript
AnalyticsEvents.login('email');
AnalyticsEvents.signUp('google');
AnalyticsEvents.logout();
```

#### Course Events
```typescript
AnalyticsEvents.viewCourse(courseId, courseName);
AnalyticsEvents.enrollCourse(courseId, courseName);
AnalyticsEvents.completeLearning(courseId, lessonId);
```

#### Social Events
```typescript
AnalyticsEvents.createPost('text');
AnalyticsEvents.shareContent('course', contentId);
AnalyticsEvents.likeContent('post', contentId);
```

#### Ad Events
```typescript
AnalyticsEvents.viewAd(adId, 'banner');
AnalyticsEvents.clickAd(adId, 'sidebar');
```

#### Job Events
```typescript
AnalyticsEvents.viewJob(jobId, jobTitle);
AnalyticsEvents.applyJob(jobId, jobTitle);
```

#### Event Events
```typescript
AnalyticsEvents.viewEvent(eventId, eventName);
AnalyticsEvents.registerEvent(eventId, eventName);
```

#### Chat Events
```typescript
AnalyticsEvents.sendMessage('direct');
AnalyticsEvents.startChat('user');
```

#### Search Events
```typescript
AnalyticsEvents.search(searchTerm, 'courses');
```

#### Navigation Events
```typescript
AnalyticsEvents.clickNavigation('/courses', 'header');
```

### 4. Analytics Provider (`components/providers/analytics-provider.tsx`)

Automatic page view tracking that monitors route changes.

**Features:**
- Tracks all route changes automatically
- Converts route paths to readable page names
- Handles dynamic routes
- Includes search parameters in tracking

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Optional: External analytics endpoint for Web Vitals
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/metrics

# Google Analytics (if using)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Analytics (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
# ... other Firebase config
```

### Next.js Config

The `instrumentationHook` is enabled in `next.config.ts`:

```typescript
experimental: {
  instrumentationHook: true,
}
```

## Usage

### Adding the WebVitals Component

Already added to the root layout (`app/[locale]/layout.tsx`):

```tsx
import { WebVitals } from '@/components/analytics/web-vitals';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
```

### Tracking Custom Events

```typescript
import { logEvent, AnalyticsEvents } from '@/lib/firebase/analytics';

// Track a custom event
logEvent('custom_event', {
  category: 'user_action',
  label: 'button_click',
  value: 1
});

// Use predefined events
AnalyticsEvents.login('email');
```

### Setting User Properties

```typescript
import { setUserId, setUserProperties } from '@/lib/firebase/analytics';

// Set user ID
setUserId(user.id);

// Set user properties
setUserProperties({
  role: 'instructor',
  subscription: 'premium',
  language: 'en'
});
```

## Google Analytics Integration

To integrate with Google Analytics for Web Vitals:

1. Add Google Analytics script to your layout:

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
  `}
</Script>
```

2. The `WebVitals` component will automatically detect and use `window.gtag` if available.

## Viewing Analytics Data

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Analytics → Events
4. View Web Vitals events: `web_vitals`, `web_vitals_fcp`, `web_vitals_lcp`, etc.

### Development Mode

In development, Web Vitals are logged to the browser console:

```javascript
[Web Vitals] {
  name: 'LCP',
  value: 1234.5,
  rating: 'good',
  id: 'v1-...',
  navigationType: 'navigate'
}
```

## Performance Monitoring

### Web Vitals Thresholds

- **Good**: Metric is within recommended thresholds
- **Needs Improvement**: Metric is borderline
- **Poor**: Metric needs optimization

### Key Metrics to Monitor

1. **LCP** (Largest Contentful Paint)
   - Good: < 2.5s
   - Poor: > 4.0s
   - **Impact**: User perceived load time

2. **FID** (First Input Delay)
   - Good: < 100ms
   - Poor: > 300ms
   - **Impact**: Page interactivity

3. **CLS** (Cumulative Layout Shift)
   - Good: < 0.1
   - Poor: > 0.25
   - **Impact**: Visual stability

4. **INP** (Interaction to Next Paint)
   - Good: < 200ms
   - Poor: > 500ms
   - **Impact**: Runtime responsiveness

5. **TTFB** (Time to First Byte)
   - Good: < 800ms
   - Poor: > 1800ms
   - **Impact**: Server/network performance

## Best Practices

### 1. Error Handling
All analytics functions include try-catch blocks to prevent analytics errors from breaking the app.

### 2. Server-Side Rendering
Analytics functions check for `typeof window === 'undefined'` to safely skip during SSR.

### 3. Privacy
- Consider user consent before tracking
- Anonymize sensitive data
- Follow GDPR/privacy regulations

### 4. Performance
- Use `navigator.sendBeacon()` for reliable metric reporting
- Avoid blocking the main thread
- Batch events when possible

### 5. Development
- Metrics are logged to console in development mode
- Use meaningful event names and consistent naming conventions

## Troubleshooting

### Web Vitals Not Appearing

1. Check that `instrumentationHook` is enabled in `next.config.ts`
2. Verify `instrumentation-client.ts` is at the root of the app
3. Check browser console for errors
4. Ensure Firebase is initialized correctly

### Duplicate Metrics

The `WebVitals` component uses `useRef` to track reported metrics and prevent duplicates.

### Analytics Not Working in Production

1. Verify environment variables are set in production
2. Check Firebase project configuration
3. Ensure analytics is enabled in Firebase Console
4. Check Content Security Policy (CSP) headers

## Resources

- [Next.js Analytics Documentation](https://nextjs.org/docs/app/guides/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Google Analytics](https://developers.google.com/analytics)

## Migration Notes

### From Previous Analytics Setup

If migrating from an older analytics setup:

1. The `instrumentation-client.ts` file is new in Next.js 16
2. Web Vitals tracking complements existing Firebase Analytics
3. No changes needed to existing `AnalyticsEvents` usage
4. Page view tracking continues to work via `AnalyticsProvider`

## Future Enhancements

Potential additions:

- [ ] Integrate with Vercel Analytics
- [ ] Add custom performance marks
- [ ] Implement A/B testing tracking
- [ ] Add conversion funnel tracking
- [ ] Implement real-time dashboard
- [ ] Add heatmap tracking
- [ ] Implement session recording
- [ ] Add error boundaries with analytics

## Support

For issues or questions about analytics:

1. Check the Firebase Console for data
2. Review browser console for errors
3. Verify environment variables
4. Check Next.js build logs
