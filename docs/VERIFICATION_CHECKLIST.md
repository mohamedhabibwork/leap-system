# Verification Checklist - Modern Social Platform

Use this checklist to verify all features are working correctly with full RTL/LTR and theme support.

---

## ✅ Core Features Verification

### Events Feature
- [ ] Navigate to `/hub/events` - page loads without errors
- [ ] Events display in grid layout
- [ ] Click "Create Event" button - modal opens
- [ ] Fill event form and submit - event created
- [ ] Click on an event - detail page loads
- [ ] Click "Register" - dropdown shows options
- [ ] Select "Going" - success toast appears
- [ ] Verify button updates to show "Going"
- [ ] Click save icon - event saved
- [ ] Share event works

### Jobs Feature
- [ ] Navigate to `/hub/jobs` - page loads
- [ ] Jobs display with company logos
- [ ] Filter by type/level/location works
- [ ] Click "Post a Job" - modal opens
- [ ] Submit job posting - job created
- [ ] Click on a job - detail page loads
- [ ] Click "Apply Now" - application form opens
- [ ] Upload resume (PDF) - file uploads successfully
- [ ] Submit application - success message
- [ ] Save job - bookmark works

### Courses Feature
- [ ] Browse courses at `/hub/courses`
- [ ] Click on course - detail page loads
- [ ] Click "Enroll Free" - enrolled successfully
- [ ] For paid course - redirects to checkout
- [ ] View course progress
- [ ] Mark lesson as complete
- [ ] Submit course review

### Notifications
- [ ] Notification bell appears in header
- [ ] Unread count badge shows (if notifications exist)
- [ ] Click bell - dropdown panel opens
- [ ] Notifications list displays
- [ ] Click notification - navigates to correct page
- [ ] Mark as read - notification updates
- [ ] Mark all as read - all update
- [ ] Real-time notification arrives (test with WebSocket)

### Search
- [ ] Search bar in navigation/header
- [ ] Type query (2+ chars) - suggestions appear
- [ ] Recent searches show when focused
- [ ] Trending topics display
- [ ] Submit search - navigates to results page
- [ ] Results display for all content types
- [ ] Filters work (type, sort)
- [ ] Click result - navigates correctly

### Discovery
- [ ] Navigate to `/hub/discover`
- [ ] Tabs display: Trending, Groups, Events, Jobs, Courses
- [ ] Trending topics sidebar shows
- [ ] Featured content displays
- [ ] Suggested groups show
- [ ] Click "View all" links work

### Stories
- [ ] Stories bar displays at top of social feed
- [ ] Click "+" to create story
- [ ] Upload image - preview shows
- [ ] Add caption - text input works
- [ ] Post story - success
- [ ] Story avatar appears in bar
- [ ] Gradient ring shows for unviewed
- [ ] Click story - full-screen viewer opens
- [ ] Auto-advance to next story
- [ ] Progress bars work
- [ ] Reply to story works

---

## ✅ RTL/LTR Verification

### Test in LTR Mode (English)
- [ ] Text aligns to left naturally
- [ ] Icons positioned correctly
- [ ] Forms flow left-to-right
- [ ] Dropdowns align properly
- [ ] Cards display correctly
- [ ] Modals center properly

### Test in RTL Mode (Arabic)
- [ ] Change locale to Arabic (`/ar/hub/...`)
- [ ] Verify `dir="rtl"` on `<html>` tag
- [ ] Text aligns to right
- [ ] Icons flip where needed (arrows, chevrons)
- [ ] Forms flow right-to-left
- [ ] Search bar: icon on right, clear button on left
- [ ] Date badge on events: positioned on right
- [ ] Notification items: avatar on right, content on left
- [ ] All `text-start` classes work (right alignment in RTL)

### RTL-Specific Checks:
- [ ] Event cards: date badge on right side
- [ ] Job cards: company logo flows correctly
- [ ] Notification items: unread dot on left
- [ ] Search suggestions: icons on right
- [ ] Story viewer: navigation arrows flipped
- [ ] Forms: labels and inputs aligned right
- [ ] Modals: close button on left
- [ ] Dropdowns: align to appropriate edge

---

## ✅ Theme Verification

### Test in Light Theme
- [ ] All text is readable (good contrast)
- [ ] Buttons visible and clickable
- [ ] Cards have proper backgrounds
- [ ] Borders and dividers visible
- [ ] Hover states work
- [ ] Focus indicators visible
- [ ] Loading skeletons appropriate
- [ ] Badges have good contrast
- [ ] Modals have proper overlay

### Test in Dark Theme
- [ ] Toggle dark theme
- [ ] All text readable on dark backgrounds
- [ ] Cards don't blend into background
- [ ] Input fields visible
- [ ] Placeholder text visible
- [ ] Borders and dividers visible but subtle
- [ ] Hover states visible
- [ ] Focus indicators bright enough
- [ ] Loading skeletons visible
- [ ] Badges work in dark mode
- [ ] Modals overlay visible

### Theme-Specific Checks:
- [ ] Event cards: gradient fallbacks work
- [ ] Job cards: badges readable
- [ ] Notification panel: proper background
- [ ] Search dropdown: good contrast
- [ ] Story viewer: overlays visible
- [ ] Modals: proper backdrop
- [ ] Toasts: visible in both themes

---

## ✅ Combined Testing (Critical!)

### LTR + Light Theme
- [ ] Navigate through all pages
- [ ] Test all buttons and forms
- [ ] Verify everything looks professional

### LTR + Dark Theme
- [ ] Switch to dark theme
- [ ] Navigate through all pages
- [ ] Verify readability and contrast

### RTL + Light Theme
- [ ] Switch locale to Arabic
- [ ] Navigate through all pages
- [ ] Verify text alignment and icon positioning

### RTL + Dark Theme
- [ ] Keep Arabic locale
- [ ] Switch to dark theme
- [ ] Navigate through all pages
- [ ] **This is the ultimate test!**
- [ ] Verify everything works perfectly

---

## ✅ Responsive Design Verification

### Mobile (< 640px)
- [ ] Events page - cards stack vertically
- [ ] Jobs page - list view works
- [ ] Modals fit on screen
- [ ] Forms are usable
- [ ] Buttons properly sized (min 44x44px)
- [ ] Search bar full width
- [ ] Navigation accessible

### Tablet (640px - 1024px)
- [ ] Grid layout shows 2 columns
- [ ] Sidebar filters work
- [ ] Modals properly sized
- [ ] Stories bar scrollable

### Desktop (> 1024px)
- [ ] Grid layout shows 3 columns
- [ ] All content comfortably spaced
- [ ] Modals centered and proper width
- [ ] Multi-column layouts work

---

## ✅ Performance Verification

- [ ] Initial page load < 3 seconds
- [ ] Lighthouse score > 85
- [ ] No console errors
- [ ] Images load with placeholders
- [ ] Infinite scroll performs well
- [ ] Search is responsive (< 300ms)
- [ ] Modals open smoothly
- [ ] Animations are smooth (60fps)
- [ ] WebSocket connects quickly
- [ ] No memory leaks (check DevTools)

---

## ✅ Accessibility Verification

- [ ] Tab navigation works throughout
- [ ] Focus indicators visible
- [ ] ARIA labels on icon buttons
- [ ] Screen reader friendly
- [ ] Keyboard shortcuts work
- [ ] Color contrast meets WCAG AA
- [ ] Form errors announced
- [ ] Status messages announced

---

## ✅ Integration Verification

- [ ] WebSocket connects on login
- [ ] Notifications arrive in real-time
- [ ] JWT auth works on all endpoints
- [ ] File uploads work (resumes, images)
- [ ] Cache invalidation works after mutations
- [ ] Optimistic updates work
- [ ] Error handling shows user-friendly messages
- [ ] Toast notifications appear and dismiss

---

## ✅ Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ✅ Backend Verification

### Endpoints to Test:

```bash
# Events
curl -X GET http://localhost:3001/api/v1/events
curl -X POST http://localhost:3001/api/v1/events -H "Authorization: Bearer TOKEN"

# Jobs
curl -X GET http://localhost:3001/api/v1/jobs
curl -X POST http://localhost:3001/api/v1/jobs -H "Authorization: Bearer TOKEN"

# Notifications
curl -X GET http://localhost:3001/api/v1/notifications -H "Authorization: Bearer TOKEN"

# Search
curl -X GET http://localhost:3001/api/v1/search?query=test

# Stories (if backend ready)
curl -X GET http://localhost:3001/api/v1/stories
```

---

## ⚠️ Known Limitations / TODOs

### Backend Stories Module
- [ ] Stories module may need to be created in backend
- [ ] Database schema for stories table
- [ ] Auto-expiry after 24 hours (cron job or trigger)
- [ ] Story views tracking

### Media Upload
- [ ] Verify `/media/upload` endpoint exists
- [ ] Configure file size limits
- [ ] Set up media storage (S3, Cloudinary, etc.)

### Payment Integration
- [ ] Configure payment provider for paid courses
- [ ] Set up webhook handlers
- [ ] Test checkout flow

### Email Notifications
- [ ] Configure email service
- [ ] Test notification emails
- [ ] Email templates for all notification types

---

## 🎯 Success Criteria

### Minimum Requirements:
- ✅ All pages load without errors
- ✅ All buttons and forms work
- ✅ Works in LTR and RTL
- ✅ Works in light and dark themes
- ✅ No console errors
- ✅ Responsive on mobile

### Ideal State:
- ✅ Real-time notifications working
- ✅ WebSocket connected and stable
- ✅ File uploads functional
- ✅ Search returns results quickly
- ✅ Stories post and display
- ✅ All interactions smooth
- ✅ Perfect in all 4 combinations (LTR/RTL × Light/Dark)

---

## 📊 Testing Metrics

Track these during testing:

| Metric | Target | Actual |
|--------|--------|--------|
| Page Load Time | < 3s | __ |
| Lighthouse Score | > 85 | __ |
| API Response Time | < 500ms | __ |
| WebSocket Latency | < 100ms | __ |
| Search Speed | < 300ms | __ |
| Bundle Size | < 500KB | __ |

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/lib/api/events'"
**Solution:** Check TypeScript paths are configured in `tsconfig.json`

### Issue: WebSocket connection fails
**Solution:** Verify backend WebSocket gateway is running and `NEXT_PUBLIC_WS_URL` is correct

### Issue: Images not loading
**Solution:** Check image domains are configured in `next.config.js`

### Issue: RTL looks wrong
**Solution:** Verify Tailwind RTL plugin and all classes use logical properties

### Issue: Dark theme has wrong colors
**Solution:** Check CSS variables in `globals.css` for `.dark` class

---

## ✨ Final Checklist

Before considering this complete:

- [ ] All features tested manually
- [ ] All 4 theme/direction combinations tested
- [ ] No console errors or warnings
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessibility tested with keyboard
- [ ] Test suite runs successfully
- [ ] Documentation reviewed
- [ ] Integration guide followed
- [ ] Backend endpoints verified
- [ ] Performance metrics acceptable

---

## 🎊 When All Checks Pass...

**Congratulations!** 🎉

Your modern social media platform is:
- ✅ Feature complete
- ✅ Internationally ready
- ✅ Theme customizable
- ✅ Performance optimized
- ✅ Production ready

**Ready to launch!** 🚀

---

**Need help?** Review:
- [Implementation Summary](MODERN_SOCIAL_PLATFORM_IMPLEMENTATION.md)
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Quick Start](QUICK_START.md)
- [Features Overview](FEATURES_OVERVIEW.md)
