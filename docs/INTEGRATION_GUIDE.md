# Integration Guide - Modern Social Platform Features

This guide will help you integrate all the new features into your existing application.

---

## 🔧 Step 1: Add NotificationBell to Navigation

The notification bell should be added to your main navigation/header component.

**Find your header component** (likely in `apps/web/components/layout/header.tsx` or similar):

```tsx
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Logo />
        
        {/* Navigation */}
        <nav>...</nav>
        
        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Add Notification Bell here */}
          <NotificationBell />
          
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

---

## 🔧 Step 2: Initialize WebSocket Connection

Add WebSocket initialization to your providers or root layout.

**Update `apps/web/app/providers.tsx`** (or create if doesn't exist):

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { notificationsWS } from '@/lib/websocket/notifications';
import { useNotificationsWebSocket } from '@/lib/hooks/use-api';

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isConnected } = useNotificationsWebSocket(!!session?.accessToken);

  useEffect(() => {
    if (session?.accessToken) {
      notificationsWS.connect(session.accessToken);
    }

    return () => {
      notificationsWS.disconnect();
    };
  }, [session?.accessToken]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

---

## 🔧 Step 3: Add StoriesBar to Social Feed

Add the stories carousel to your social feed page.

**Update `apps/web/app/[locale]/(hub)/hub/social/page.tsx`**:

```tsx
import { StoriesBar } from '@/components/stories/stories-bar';

export default function SocialFeedPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Add Stories Bar at the top */}
      <StoriesBar />
      
      {/* Create Post */}
      <CreatePost context="timeline" placeholder="What's on your mind?" />
      
      {/* Posts Feed */}
      {/* ... existing feed code ... */}
    </div>
  );
}
```

---

## 🔧 Step 4: Add Global Search to Navigation

Add the search bar to your main navigation or a dedicated search area.

**Option 1: Add to Header**:

```tsx
import { SearchBar } from '@/components/search/search-bar';

export function Header() {
  return (
    <header>
      <div className="container flex items-center gap-4">
        <Logo />
        
        {/* Add Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchBar placeholder="Search..." />
        </div>
        
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
```

**Option 2: Dedicated Search Button**:

```tsx
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';

export function Header() {
  const router = useRouter();
  
  return (
    <header>
      {/* ... other header content ... */}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/hub/search')}
      >
        <Search className="h-5 w-5" />
      </Button>
      
      <NotificationBell />
    </header>
  );
}
```

---

## 🔧 Step 5: Update Navigation Menu

Add links to new pages in your navigation menu.

```tsx
export function NavigationMenu() {
  return (
    <nav>
      <Link href="/hub/social">Social</Link>
      <Link href="/hub/events">Events</Link>
      <Link href="/hub/jobs">Jobs</Link>
      <Link href="/hub/courses">Courses</Link>
      <Link href="/hub/discover">Discover</Link>
      <Link href="/hub/notifications">Notifications</Link>
    </nav>
  );
}
```

---

## 🔧 Step 6: Backend Stories Module (If Needed)

If your backend doesn't have a stories module, you'll need to create it:

### Database Schema:

```sql
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(10) NOT NULL, -- 'image' or 'video'
  duration INTEGER, -- For videos
  caption VARCHAR(200),
  background_color VARCHAR(20),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE story_views (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Index for performance
CREATE INDEX idx_stories_expires ON stories(expires_at);
CREATE INDEX idx_stories_user ON stories(user_id);
```

### NestJS Module Structure:

```typescript
// apps/backend/src/modules/stories/stories.controller.ts
@Controller('stories')
export class StoriesController {
  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.storiesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: any) {
    return this.storiesService.create({ ...dto, userId: user.userId });
  }

  // ... other endpoints as defined in the API
}
```

---

## 🔧 Step 7: Environment Variables

Add required environment variables:

```env
# WebSocket URL
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Media Upload Settings
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
NEXT_PUBLIC_ALLOWED_VIDEO_TYPES=video/mp4,video/webm
```

---

## 🔧 Step 8: Package Installation

Install required dependencies if not already present:

```bash
# Using npm
npm install socket.io-client react-hook-form date-fns

# Using bun
bun add socket.io-client react-hook-form date-fns

# Dev dependencies for testing
bun add -d @testing-library/react @testing-library/jest-dom @playwright/test
```

---

## 🔧 Step 9: Update Proxy Configuration

Ensure your proxy includes the new routes:

**Update `apps/web/proxy.ts`** if needed:

```typescript
const routes = [
  '/api/v1/social/*',
  '/api/v1/events/*',
  '/api/v1/jobs/*',
  '/api/v1/courses/*',
  '/api/v1/notifications/*',
  '/api/v1/stories/*',
  '/api/v1/search/*',
  '/api/v1/media/*',
];
```

---

## 🧪 Testing Your Integration

### 1. Test Notifications

```bash
# Start your app
bun run dev

# Open browser console and check for WebSocket connection:
# Should see: "Connected to notifications WebSocket"
```

### 2. Test Event Registration

1. Navigate to `/hub/events`
2. Click on an event
3. Click "Register" button
4. Select "Going"
5. Verify success toast appears
6. Verify button updates to "Going"

### 3. Test Job Application

1. Navigate to `/hub/jobs`
2. Click on a job
3. Click "Apply Now"
4. Fill in the application form
5. Upload a resume
6. Submit application
7. Verify success toast

### 4. Test Stories

1. Add `<StoriesBar />` to your social feed
2. Click the "+" button
3. Upload an image
4. Add a caption
5. Post the story
6. Click on your story avatar to view

### 5. Test Search

1. Click search icon or navigate to `/hub/search`
2. Type a query (at least 2 characters)
3. See suggestions appear
4. Submit search
5. See results with filters

### 6. Test RTL Mode

```tsx
// Temporarily set RTL for testing
<html dir="rtl" lang="ar">
```

Navigate through the app and verify:
- Text aligns correctly
- Icons flip where appropriate
- Forms layout correctly
- Dropdowns position correctly

### 7. Test Dark Theme

Toggle your theme to dark mode and verify:
- All text is readable
- Buttons and cards have proper contrast
- Hover states are visible
- Loading states look good

---

## 🎨 Styling Best Practices

### Always Use Logical Properties:

```tsx
// ✅ CORRECT
<div className="ms-4 text-start">Content</div>

// ❌ WRONG
<div className="ml-4 text-left">Content</div>
```

### Always Use Theme Colors:

```tsx
// ✅ CORRECT
<Card className="bg-card text-card-foreground border-border">
  Content
</Card>

// ❌ WRONG
<Card className="bg-white text-black border-gray-200 dark:bg-gray-900">
  Content
</Card>
```

### Flip Directional Icons:

```tsx
// ✅ CORRECT
<ChevronRight className="h-4 w-4 rtl:rotate-180" />

// ❌ WRONG
<ChevronRight className="h-4 w-4" />
```

---

## 🐛 Troubleshooting

### Issue: TypeScript errors in use-api.ts

**Solution:** Ensure all imports are at the top of the file:

```typescript
import { eventsAPI, type Event, type CreateEventDto } from '../api/events';
import { jobsAPI, type Job, type ApplyJobDto } from '../api/jobs';
// ... etc
```

### Issue: WebSocket not connecting

**Solution:** 
1. Verify `NEXT_PUBLIC_WS_URL` is set correctly
2. Check backend WebSocket gateway is running
3. Verify JWT token is valid

### Issue: File uploads failing

**Solution:**
1. Check `/media/upload` endpoint exists in backend
2. Verify file size limits
3. Check Content-Type header is set correctly

### Issue: RTL layout looks broken

**Solution:**
1. Verify `dir="rtl"` is set on `<html>` tag
2. Check Tailwind RTL plugin is enabled
3. Ensure all components use logical properties

### Issue: Dark theme colors wrong

**Solution:**
1. Verify CSS variables are defined in `globals.css`
2. Check `.dark` class is applied to `<html>` tag
3. Ensure components use theme colors, not hardcoded values

---

## 📚 Additional Resources

### Components Documentation:
- Events: [Event Card](apps/web/components/cards/event-card.tsx), [Event Detail](apps/web/app/[locale]/(hub)/hub/events/[id]/page.tsx)
- Jobs: [Job Card](apps/web/components/cards/job-card.tsx), [Job Detail](apps/web/app/[locale]/(hub)/hub/jobs/[id]/page.tsx)
- Notifications: [Bell](apps/web/components/notifications/notification-bell.tsx), [Panel](apps/web/components/notifications/notification-panel.tsx)
- Search: [Bar](apps/web/components/search/search-bar.tsx), [Results](apps/web/components/search/search-results.tsx)
- Stories: [Bar](apps/web/components/stories/stories-bar.tsx), [Viewer](apps/web/components/stories/story-viewer.tsx)

### API Documentation:
- [Events API](apps/web/lib/api/events.ts)
- [Jobs API](apps/web/lib/api/jobs.ts)
- [Courses API](apps/web/lib/api/courses.ts)
- [Notifications API](apps/web/lib/api/notifications.ts)
- [Stories API](apps/web/lib/api/stories.ts)
- [Search API](apps/web/lib/api/search.ts)

### Hooks Documentation:
- [All Hooks](apps/web/lib/hooks/use-api.ts) - 68 new hooks for all features

---

## ✅ Integration Checklist

- [ ] Add `NotificationBell` to header
- [ ] Initialize WebSocket in providers
- [ ] Add `StoriesBar` to social feed
- [ ] Add search bar to navigation
- [ ] Update navigation menu with new links
- [ ] Set environment variables
- [ ] Install required packages
- [ ] Update proxy configuration
- [ ] Test in LTR mode
- [ ] Test in RTL mode
- [ ] Test in light theme
- [ ] Test in dark theme
- [ ] Test all 4 combinations (LTR+Light, LTR+Dark, RTL+Light, RTL+Dark)
- [ ] Test on mobile devices
- [ ] Test WebSocket reconnection
- [ ] Test file uploads
- [ ] Test real-time notifications
- [ ] Run test suite
- [ ] Check for console errors
- [ ] Verify accessibility

---

**Need Help?** Check the [Implementation Summary](MODERN_SOCIAL_PLATFORM_IMPLEMENTATION.md) for detailed information.
