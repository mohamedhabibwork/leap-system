# Analytics Quick Start Guide

## ✅ What's Already Configured

The analytics system is **already set up and working**! Here's what's been implemented:

1. ✅ **Next.js Web Vitals** - Tracks page performance automatically
2. ✅ **Firebase Analytics** - Tracks custom events and user behavior
3. ✅ **Error Tracking** - Global error handling
4. ✅ **Page Views** - Automatic route tracking

## 🚀 Quick Test

### 1. Start the Dev Server

```bash
cd apps/web
npm run dev
```

### 2. Open Browser DevTools

- Press `F12` or `Cmd+Option+I` (Mac)
- Go to **Console** tab

### 3. Look for These Messages

```
[Instrumentation] Analytics and monitoring initialized
[Web Vitals] { name: 'FCP', value: 892.3, rating: 'good', ... }
[Web Vitals] { name: 'LCP', value: 1234.5, rating: 'good', ... }
```

### 4. Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Analytics** → **Events**
4. Look for: `web_vitals`, `page_view`, etc.

✅ **If you see these messages, analytics is working!**

## 📊 Track Custom Events

### Basic Event Tracking

```typescript
import { logEvent } from '@/lib/firebase/analytics';

// Track any custom event
logEvent('button_clicked', {
  button_name: 'enroll',
  page: 'course_detail'
});
```

### Pre-built Event Helpers

```typescript
import { AnalyticsEvents } from '@/lib/firebase/analytics';

// User actions
AnalyticsEvents.login('email');
AnalyticsEvents.signUp('google');

// Course actions
AnalyticsEvents.viewCourse(courseId, courseName);
AnalyticsEvents.enrollCourse(courseId, courseName);

// Social actions
AnalyticsEvents.createPost('text');
AnalyticsEvents.shareContent('course', contentId);
AnalyticsEvents.likeContent('post', postId);

// Search
AnalyticsEvents.search('machine learning', 'courses');
```

## 🎯 Common Use Cases

### Track Button Clicks

```tsx
import { logEvent } from '@/lib/firebase/analytics';

<Button 
  onClick={() => {
    logEvent('cta_clicked', { 
      button_text: 'Get Started',
      location: 'hero_section' 
    });
    // Your button logic
  }}
>
  Get Started
</Button>
```

### Track Form Submissions

```tsx
import { logEvent } from '@/lib/firebase/analytics';

const handleSubmit = async (data) => {
  logEvent('form_submitted', { 
    form_name: 'contact',
    form_fields: Object.keys(data).length 
  });
  
  // Your form submission logic
};
```

### Track User Login

```tsx
import { AnalyticsEvents, setUserId, setUserProperties } from '@/lib/firebase/analytics';

const handleLogin = async (user) => {
  // Track login event
  AnalyticsEvents.login('email');
  
  // Set user ID for tracking
  setUserId(user.id);
  
  // Set user properties
  setUserProperties({
    role: user.role,
    subscription: user.subscription,
    created_at: user.createdAt
  });
};
```

### Track Page Views (Manual)

```tsx
import { logPageView } from '@/lib/firebase/analytics';

// Page views are tracked automatically, but you can also track manually
useEffect(() => {
  logPageView('Course Details', {
    course_id: courseId,
    category: category
  });
}, [courseId]);
```

## 🧪 Test Your Analytics

### Method 1: Use the Test Component

1. Add the test component to any page:

```tsx
import { AnalyticsTest } from '@/components/analytics/analytics-test';

export default function TestPage() {
  return (
    <div className="container py-8">
      <h1>Analytics Test</h1>
      <AnalyticsTest />
    </div>
  );
}
```

2. Click the test buttons
3. Check console and Firebase for events

### Method 2: Manual Testing

```tsx
// Open browser console and run:
logEvent('test_event', { test: true });

// Check console output:
// ✅ Event tracked: test_event

// Check Firebase Console → Analytics → Events
```

## 📈 View Analytics Data

### Firebase Console

1. **Real-time data:**
   - Go to Analytics → Events → View realtime data
   - See events as they happen (may take a few seconds)

2. **Historical data:**
   - Go to Analytics → Events
   - View aggregated data (updates every 24 hours)

3. **Custom reports:**
   - Go to Analytics → Custom
   - Create custom dashboards

### Web Vitals Metrics

Look for these events in Firebase:

- `web_vitals` - All metrics combined
- `web_vitals_fcp` - First Contentful Paint
- `web_vitals_lcp` - Largest Contentful Paint
- `web_vitals_cls` - Cumulative Layout Shift
- `web_vitals_fid` - First Input Delay
- `web_vitals_ttfb` - Time to First Byte
- `web_vitals_inp` - Interaction to Next Paint

## 🔧 Configuration

### Required (Already Set)

Your `.env.local` should have:

```bash
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase vars
```

### Optional Additions

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Custom Analytics Endpoint (optional)
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://api.example.com/analytics

# Google Site Verification (optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

## 📚 Available Events

### Authentication
- `login` - User logged in
- `sign_up` - New user registered
- `logout` - User logged out

### Courses
- `view_item` (course) - Course viewed
- `join_group` (course) - Course enrolled
- `tutorial_complete` - Lesson completed

### Social
- `post_created` - Post created
- `share` - Content shared
- `like` - Content liked

### Ads
- `ad_view` - Ad displayed
- `ad_click` - Ad clicked

### Jobs
- `view_item` (job) - Job viewed
- `apply_job` - Job application

### Events
- `view_item` (event) - Event viewed
- `register_event` - Event registration

### Chat
- `send_message` - Message sent
- `start_chat` - Chat started

### Search
- `search` - Search performed

### Navigation
- `select_content` - Navigation click

## 🐛 Troubleshooting

### Events Not Showing in Console

**Check:**
- Is dev server running?
- Are you in the browser console (not terminal)?
- Refresh the page

### Events Not in Firebase

**Check:**
- Firebase credentials in `.env.local`
- Analytics enabled in Firebase Console
- Wait 5-10 minutes (real-time data has delay)
- Check "DebugView" in Firebase for instant results

### Web Vitals Not Appearing

**Check:**
- Navigate between pages (some metrics only fire after interaction)
- Wait a few seconds after page load
- Check Network tab for analytics requests

## 🎓 Learn More

- **Full Documentation:** `docs/ANALYTICS.md`
- **Implementation Details:** `docs/ANALYTICS_IMPLEMENTATION.md`
- **Environment Variables:** `docs/ANALYTICS_ENV_EXAMPLE.md`
- **Next.js Docs:** https://nextjs.org/docs/app/guides/analytics
- **Web Vitals:** https://web.dev/vitals/
- **Firebase Analytics:** https://firebase.google.com/docs/analytics

## ✨ Best Practices

1. **Name events consistently:** Use snake_case (e.g., `button_clicked`)
2. **Add context:** Include relevant properties (e.g., `page`, `section`)
3. **Don't over-track:** Focus on meaningful user actions
4. **Test in development:** Always verify events work before production
5. **Respect privacy:** Don't track sensitive data
6. **Use predefined events:** Use `AnalyticsEvents` helpers when available

## 💡 Tips

- **Development mode:** Events are logged to console
- **Production mode:** Events go to Firebase only
- **Error safety:** All analytics wrapped in try-catch
- **SSR-safe:** Analytics automatically skipped on server
- **Non-blocking:** Analytics never slows down your app

## 🚀 You're Ready!

Start tracking events in your components using:

```typescript
import { AnalyticsEvents } from '@/lib/firebase/analytics';

// That's it! 🎉
```

---

**Need help?** Check the full docs in `docs/ANALYTICS.md`
