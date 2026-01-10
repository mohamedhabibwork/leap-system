# Analytics Implementation Summary

## What Was Implemented

Following the [Next.js 16 Analytics Guide](https://nextjs.org/docs/app/guides/analytics), we've implemented comprehensive analytics tracking for the application.

## Files Created

### 1. **instrumentation-client.ts** (Root Level)
Location: `apps/web/instrumentation-client.ts`

**Purpose:** Client-side instrumentation that runs before the app starts

**Features:**
- Global error tracking
- Unhandled promise rejection handling
- Initial page load performance monitoring
- Runs before React hydration

### 2. **components/analytics/web-vitals.tsx**
Location: `apps/web/components/analytics/web-vitals.tsx`

**Purpose:** Track Core Web Vitals using Next.js's built-in `useReportWebVitals` hook

**Metrics Tracked:**
- **TTFB** - Time to First Byte
- **FCP** - First Contentful Paint
- **LCP** - Largest Contentful Paint
- **FID** - First Input Delay
- **CLS** - Cumulative Layout Shift
- **INP** - Interaction to Next Paint

**Integrations:**
- Firebase Analytics (automatic)
- Google Analytics (if configured)
- External analytics endpoint (if configured)
- Console logging in development

### 3. **lib/analytics/google-analytics.ts**
Location: `apps/web/lib/analytics/google-analytics.ts`

**Purpose:** Optional Google Analytics integration helpers

**Features:**
- Page view tracking
- Custom event tracking
- Web Vitals tracking for GA
- User properties
- Pre-built event helpers (GAEvents)

### 4. **docs/ANALYTICS.md**
Location: `apps/web/docs/ANALYTICS.md`

**Purpose:** Comprehensive documentation for the analytics system

**Contents:**
- Component overview
- Configuration guide
- Usage examples
- Event tracking guide
- Best practices
- Troubleshooting

### 5. **docs/ANALYTICS_ENV_EXAMPLE.md**
Location: `apps/web/docs/ANALYTICS_ENV_EXAMPLE.md`

**Purpose:** Environment variable examples for analytics configuration

## Files Modified

### 1. **app/[locale]/layout.tsx**
- Added `WebVitals` component import
- Added `<WebVitals />` component to the body
- Component runs on all pages automatically

### 2. **next.config.ts**
- Enabled `instrumentationHook: true` in experimental features
- Allows Next.js to run `instrumentation-client.ts`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Application Start                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼───────────────┐
        │ instrumentation-client.ts  │
        │  - Error tracking          │
        │  - Performance monitoring  │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │     Root Layout Loads      │
        │   <WebVitals /> Component  │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │    useReportWebVitals()    │
        │   Tracks Core Web Vitals   │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │  Firebase Analytics        │
        │  - Web Vitals events       │
        │  - Custom events           │
        │  - Page views              │
        └────────────────────────────┘
```

## Integration with Existing Analytics

The new Next.js Web Vitals tracking **complements** the existing Firebase Analytics:

### Existing (Still Working)
- `AnalyticsProvider` - Page view tracking
- `lib/firebase/analytics.ts` - Custom event tracking
- `stores/analytics.store.ts` - Analytics dashboard state

### New (Added)
- `WebVitals` component - Performance metrics
- `instrumentation-client.ts` - Early error tracking
- Google Analytics helpers (optional)

## How It Works

### 1. Application Startup
```typescript
// instrumentation-client.ts runs first
console.log('Analytics initialized');

// Global error handlers are set up
window.addEventListener('error', ...);
```

### 2. Layout Renders
```tsx
<html>
  <body>
    <NextIntlClientProvider>
      <WebVitals /> {/* Tracks Web Vitals */}
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  </body>
</html>
```

### 3. Metrics Are Collected
```typescript
useReportWebVitals((metric) => {
  // Automatically called for each Web Vital
  logEvent('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating,
  });
});
```

### 4. Data Goes To
- **Firebase Analytics** ✅ (automatic)
- **Browser Console** ✅ (development mode)
- **Google Analytics** ⚙️ (if configured)
- **Custom Endpoint** ⚙️ (if configured)

## Verification

### Check It's Working

1. **Development Mode:**
   ```bash
   npm run dev
   ```
   - Open browser DevTools Console
   - Look for `[Instrumentation] Analytics and monitoring initialized`
   - Look for `[Web Vitals]` logs with metrics

2. **Firebase Console:**
   - Go to Firebase Console → Analytics → Events
   - Look for `web_vitals` events
   - Look for individual metric events: `web_vitals_lcp`, `web_vitals_fcp`, etc.

3. **Network Tab:**
   - Open DevTools → Network
   - Filter by "analytics" or "firebase"
   - See analytics requests being sent

### Example Console Output

```javascript
[Instrumentation] Analytics and monitoring initialized

[Web Vitals] {
  name: 'FCP',
  value: 892.3,
  rating: 'good',
  id: 'v3-1234567890',
  navigationType: 'navigate'
}

[Web Vitals] {
  name: 'LCP',
  value: 1234.5,
  rating: 'good',
  id: 'v3-1234567891',
  navigationType: 'navigate'
}

[Performance] Page Load Metrics {
  pageLoadTime: '1567ms',
  domContentLoadedTime: '892ms',
  dnsTime: '23ms',
  tcpTime: '45ms',
  ttfb: '234ms'
}
```

## Usage Examples

### Track Custom Events
```typescript
import { AnalyticsEvents } from '@/lib/firebase/analytics';

// Course enrollment
AnalyticsEvents.enrollCourse(course.id, course.title);

// User login
AnalyticsEvents.login('email');

// Custom event
logEvent('button_click', { button_name: 'enroll', location: 'course_page' });
```

### Set User Properties
```typescript
import { setUserId, setUserProperties } from '@/lib/firebase/analytics';

setUserId(user.id);
setUserProperties({
  role: 'instructor',
  subscription: 'premium',
});
```

### Google Analytics (Optional)
```typescript
import { GAEvents } from '@/lib/analytics/google-analytics';

// Track custom events
GAEvents.viewItem(courseId, courseName, 'course');
GAEvents.search(searchTerm, 'courses');
```

## Performance Impact

- **Minimal:** Analytics code is lazy-loaded and non-blocking
- **Error-safe:** All analytics wrapped in try-catch
- **SSR-safe:** Checks for `typeof window === 'undefined'`
- **Optimized:** Uses `navigator.sendBeacon()` for reliability

## Next Steps

### Optional Enhancements

1. **Add Google Analytics:**
   - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`
   - Add Google Analytics scripts to layout
   - See `lib/analytics/google-analytics.ts` for examples

2. **Add Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```
   - Import and add to layout
   - Automatic on Vercel deployments

3. **Add Sentry for Error Tracking:**
   ```bash
   npm install @sentry/nextjs
   ```
   - Configure Sentry in `instrumentation-client.ts`

4. **Custom Analytics Dashboard:**
   - Build admin dashboard using `stores/analytics.store.ts`
   - Visualize Web Vitals data
   - Monitor user behavior

5. **A/B Testing:**
   - Integrate with testing framework
   - Track experiment variants
   - Measure conversion rates

## Resources

- [Next.js Analytics Docs](https://nextjs.org/docs/app/guides/analytics) ⭐
- [Web Vitals](https://web.dev/vitals/)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Vercel Analytics](https://vercel.com/analytics)

## Questions?

Check the comprehensive documentation in `docs/ANALYTICS.md` for:
- Detailed configuration
- All available events
- Troubleshooting guide
- Best practices
