# Dev Server Restart Instructions

## Critical: Dev Server Must Be Restarted

All i18n and theme configuration changes have been completed, but **the dev server must be restarted** for the changes to take effect.

## Why Restart is Needed

1. **next-intl config changes** - The plugin needs to reinitialize with the new `i18n.ts` configuration
2. **Layout changes** - The root layout structure has changed (now under `[locale]`)
3. **Middleware updates** - Route matching and locale handling has been updated
4. **Cache** - Next.js has cached the old configuration

## How to Restart

### Option 1: Stop and Restart (Recommended)
```bash
# In your terminal where the dev server is running:
1. Press Ctrl+C to stop the server
2. Wait for it to fully stop
3. Run: npm run dev
```

### Option 2: Clean Restart (If issues persist)
```bash
# Stop the dev server first (Ctrl+C)
cd apps/web
rm -rf .next
npm run dev
```

### Option 3: Full Clean (If major issues)
```bash
# Stop the dev server first (Ctrl+C)
cd apps/web
rm -rf .next node_modules/.cache
npm run dev
```

## After Restart - Verification Checklist

### 1. Check the Application Loads
- Visit: `http://localhost:3001/en`
- Should display the landing page in English
- **No errors** should appear in the console

### 2. Test Locale Switching
- Visit: `http://localhost:3001/en`
- Look for the globe icon (🌐) in the top navbar
- Click it and select "العربية" (Arabic)
- URL should change to `http://localhost:3001/ar`
- Page should reload with Arabic text and RTL layout

### 3. Test Theme Switching
- Look for sun/moon icon in the navbar
- Click and select:
  - Light theme ☀️
  - Dark theme 🌙
  - System theme 💻
- Theme should persist after page reload

### 4. Verify RTL Layout (Arabic)
- Visit: `http://localhost:3001/ar`
- Layout should be mirrored (right-to-left)
- Text should use Arabic fonts (Cairo/Noto Sans Arabic)
- All text should be in Arabic
- Navigation should be on the right side

### 5. Check Console for Errors
- Open browser DevTools (F12)
- Check Console tab
- Should see **no red errors** related to i18n or themes
- Warnings are okay (like CSS or development warnings)

## Expected URLs

After restart, these URLs should work:

- `http://localhost:3001` → redirects to `/en` (default locale)
- `http://localhost:3001/en` → English landing page ✓
- `http://localhost:3001/ar` → Arabic landing page with RTL ✓
- `http://localhost:3001/en/hub` → English hub ✓
- `http://localhost:3001/ar/hub` → Arabic hub ✓
- `http://localhost:3001/en/login` → English login ✓
- `http://localhost:3001/ar/login` → Arabic login ✓

## If Errors Persist

If you still see the "Couldn't find next-intl config file" error after restart:

### 1. Verify i18n.ts is accessible
```bash
cd apps/web
cat i18n.ts
# Should show the complete config file
```

### 2. Check next-intl version
```bash
npm list next-intl
# Should show: next-intl@3.26.5
```

### 3. Verify plugin is loaded
```bash
cat next.config.ts | grep -A 2 "createNextIntlPlugin"
# Should show: const withNextIntl = createNextIntlPlugin('./i18n.ts');
```

### 4. Full rebuild
```bash
# Stop dev server
cd apps/web
rm -rf .next
npm run build
npm run dev
```

## Common Issues and Solutions

### Issue: "Cannot find module @/components/..."
**Solution:** Path aliases issue. Verify `tsconfig.json` has correct paths.

### Issue: Theme not persisting
**Solution:** Check browser localStorage isn't blocked. next-themes stores theme preference there.

### Issue: Locale not switching
**Solution:** Check middleware is running. The config matcher should be:
```typescript
matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
```

### Issue: RTL layout not working
**Solution:** Verify `dir` attribute is set on `<html>` tag in layout.tsx

### Issue: Arabic fonts not loading
**Solution:** Check network tab in DevTools, fonts should load from fonts.googleapis.com

## Post-Restart Testing Script

After restarting, run through this quick test:

1. ✓ Visit `/en` - English loads
2. ✓ Click globe icon - dropdown shows EN/AR options
3. ✓ Select Arabic - URL changes to `/ar`, page reloads with Arabic
4. ✓ Check RTL - text flows right-to-left, layout is mirrored
5. ✓ Click theme toggle - can switch between light/dark/system
6. ✓ Theme persists - refresh page, theme stays the same
7. ✓ Click globe again - can switch back to English
8. ✓ English loads - URL changes to `/en`, page reloads with English

If all 8 steps pass, the implementation is working correctly! ✅

## Support

If issues persist after following all steps:
1. Check `docs/i18n-guide.md` for detailed documentation
2. Review `docs/i18n-implementation-summary.md` for implementation details
3. Check the browser console for specific error messages
4. Verify all files are saved and the dev server picked up the changes

## Quick Reference

**Config files:**
- `i18n.ts` - next-intl configuration
- `next.config.ts` - Next.js config with next-intl plugin
- `middleware.ts` - Locale routing and auth
- `app/[locale]/layout.tsx` - Root layout with i18n and theme providers

**Translation files:**
- `locales/en/*.json` - English translations
- `locales/ar/*.json` - Arabic translations

**Components:**
- `components/locale-switcher.tsx` - Language switcher
- `components/theme-toggle.tsx` - Theme switcher (Light/Dark/System)
- `components/navigation/navbar.tsx` - Navbar with locale and theme toggles

---

**Status:** All code fixes complete. Restart dev server to apply changes.
