# Quick Start Guide - Modern Social Platform Features

Get up and running with the new features in 5 minutes!

---

## 🚀 Step 1: Install Dependencies (30 seconds)

```bash
cd apps/web
bun install socket.io-client react-hook-form
```

---

## 🚀 Step 2: Add NotificationBell to Header (2 minutes)

Find your main header component and add:

```tsx
import { NotificationBell } from '@/components/notifications';

export function Header() {
  return (
    <header>
      {/* ... your existing header ... */}
      
      {/* Add this before your user menu */}
      <NotificationBell />
    </header>
  );
}
```

---

## 🚀 Step 3: Initialize WebSocket (1 minute)

**Option A - In Root Layout:**

Update `apps/web/app/[locale]/layout.tsx`:

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { notificationsWS } from '@/lib/websocket/notifications';
import { useNotificationsWebSocket } from '@/lib/hooks/use-api';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  useNotificationsWebSocket(!!session?.accessToken);

  useEffect(() => {
    if (session?.accessToken) {
      notificationsWS.connect(session.accessToken);
    }
    return () => notificationsWS.disconnect();
  }, [session?.accessToken]);

  return <>{children}</>;
}

// Wrap your app with WebSocketProvider
```

---

## 🚀 Step 4: Test Events Feature (1 minute)

1. Open browser to `/hub/events`
2. Click on any event
3. Click "Register" → Select "Going"
4. ✅ Success! You should see a toast notification

---

## 🚀 Step 5: Test Jobs Feature (1 minute)

1. Navigate to `/hub/jobs`
2. Click on any job
3. Click "Apply Now"
4. Fill form and click submit
5. ✅ Success! Application submitted

---

## 🎉 You're Done!

Your platform now has:
- ✅ Events with RSVP
- ✅ Jobs with applications
- ✅ Real-time notifications
- ✅ Global search
- ✅ Stories (if backend ready)
- ✅ Discovery feed
- ✅ **Full RTL/LTR support**
- ✅ **Complete dark/light theme support**

---

## 🧪 Test RTL/LTR

```typescript
// In your browser console:
document.documentElement.dir = 'rtl'; // Test RTL
document.documentElement.dir = 'ltr'; // Back to LTR
```

## 🌙 Test Dark Theme

```typescript
// In your browser console:
document.documentElement.classList.add('dark'); // Dark mode
document.documentElement.classList.remove('dark'); // Light mode
```

---

## 📚 Learn More

- [Full Implementation Details](MODERN_SOCIAL_PLATFORM_IMPLEMENTATION.md)
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Original Summary](SOCIAL_MEDIA_IMPLEMENTATION_SUMMARY.md)

---

## 💡 Pro Tips

1. **Performance**: All modals are lazy-loaded by default
2. **Caching**: Search results are cached for 1 minute
3. **Offline**: Notifications work offline with cached data
4. **Mobile**: All components are fully responsive
5. **Accessibility**: Full keyboard navigation support

---

**Questions?** Check the troubleshooting section in [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
