# PWA Implementation

This directory contains the Progressive Web App (PWA) implementation for LEAP PM.

## Components

### Service Worker (`/public/sw.js`)
The main service worker that handles:
- **Caching Strategy**: 
  - Static assets: Cache first
  - API requests: Network first with cache fallback
  - Navigation: Network first with offline page fallback
- **Offline Support**: Serves cached content when offline
- **Update Management**: Automatically updates and cleans old caches

### ServiceWorkerRegister
Registers the service worker and handles updates. Automatically included in the root layout.

### PWAInstallPrompt
Shows an install prompt when the app is installable. Handles both:
- **Standard browsers**: Uses `beforeinstallprompt` event
- **iOS**: Shows custom instructions for adding to home screen

### PWAUpdatePrompt
Notifies users when a new version of the app is available and allows them to update.

## Hooks

### usePWA
Provides PWA state and utilities:
- `isInstallable`: Whether the app can be installed
- `isInstalled`: Whether the app is currently installed
- `isOnline`: Current online/offline status
- `isUpdateAvailable`: Whether an update is available
- `install()`: Trigger install prompt
- `update()`: Update the service worker

## Manifest

The app manifest is defined in `/app/manifest.ts` and includes:
- App name and description
- Icons for various sizes
- Theme colors
- Shortcuts for quick access
- Display mode (standalone)

## Offline Page

An offline page is available at `/offline` that shows when the user is offline and no cached content is available.

## Firebase Integration

The PWA service worker (`sw.js`) works alongside the Firebase messaging service worker (`firebase-messaging-sw.js`). Both can be registered simultaneously:
- Firebase SW handles push notifications
- PWA SW handles caching and offline support

## Testing

1. **Install**: Visit the app and look for the install prompt
2. **Offline**: Use browser DevTools to simulate offline mode
3. **Update**: Modify the service worker version to test update flow
4. **Cache**: Check Application tab in DevTools to see cached resources

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Firefox (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet

## Notes

- Service worker is only registered in production or when explicitly enabled
- Install prompt respects user dismissals (won't show again for 7 days)
- Update prompt respects user dismissals (won't show again for 1 hour)
