# Internationalization (i18n) Guide

This guide explains how to use and extend the internationalization system in the LEAP PM application.

## Overview

The application supports **English (en)** and **Arabic (ar)** with full RTL (Right-to-Left) support for Arabic. The implementation uses:

- **next-intl** for Next.js internationalization
- **Google Fonts** (Cairo & Noto Sans Arabic) for Arabic typography
- **CSS logical properties** for RTL layout support
- **Locale-based routing** with middleware

## Quick Start

### Using Translations in Components

#### Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

#### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('navigation');
  
  return <button>{t('submit')}</button>;
}
```

### Translation Keys Structure

Translations are organized by feature/domain in separate JSON files:

```
locales/
├── en/
│   ├── common.json      # Common UI elements, actions, statuses
│   ├── landing.json     # Landing page content
│   ├── navigation.json  # Navigation and menus
│   └── ...
└── ar/
    ├── common.json
    ├── landing.json
    ├── navigation.json
    └── ...
```

### Naming Convention

Use dot notation for nested keys:

```json
{
  "landing": {
    "hero": {
      "title": "Welcome to LEAP PM",
      "cta": {
        "primary": "Get Started",
        "secondary": "Learn More"
      }
    }
  }
}
```

Access in components:

```tsx
const t = useTranslations('landing.hero');
<h1>{t('title')}</h1>
<button>{t('cta.primary')}</button>
```

## Adding New Translations

### 1. Add Translation Keys

Add the keys to both English and Arabic translation files:

**`locales/en/common.json`**
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

**`locales/ar/common.json`**
```json
{
  "myFeature": {
    "title": "ميزتي",
    "description": "وصف الميزة"
  }
}
```

### 2. Use in Components

```tsx
const t = useTranslations('myFeature');
<h2>{t('title')}</h2>
<p>{t('description')}</p>
```

## Advanced Features

### Variables in Translations

**Translation file:**
```json
{
  "welcome": "Welcome back, {name}!",
  "itemCount": "You have {count} items"
}
```

**Usage:**
```tsx
<h1>{t('welcome', { name: user.name })}</h1>
<p>{t('itemCount', { count: items.length })}</p>
```

### Pluralization

**English (`en/common.json`):**
```json
{
  "items": {
    "zero": "No items",
    "one": "{count} item",
    "other": "{count} items"
  }
}
```

**Arabic (`ar/common.json`):**
```json
{
  "items": {
    "zero": "لا توجد عناصر",
    "one": "عنصر واحد",
    "two": "عنصران",
    "few": "{count} عناصر",
    "many": "{count} عنصراً",
    "other": "{count} عنصر"
  }
}
```

**Usage:**
```tsx
<span>{t('items', { count: itemCount })}</span>
```

### Date and Number Formatting

```tsx
import { useLocalizedFormatter } from '@/lib/i18n/hooks';

function MyComponent() {
  const formatter = useLocalizedFormatter();
  
  return (
    <div>
      <p>{formatter.formatDate(new Date())}</p>
      <p>{formatter.formatNumber(1234.56)}</p>
      <p>{formatter.formatCurrency(99.99, 'USD')}</p>
    </div>
  );
}
```

## Custom Hooks

### useCurrentLocale()

Get the current locale:

```tsx
import { useCurrentLocale } from '@/lib/i18n/hooks';

function MyComponent() {
  const locale = useCurrentLocale(); // 'en' or 'ar'
  return <div>Current locale: {locale}</div>;
}
```

### useLocalizedRouter()

Navigate with locale awareness:

```tsx
import { useLocalizedRouter } from '@/lib/i18n/hooks';

function MyComponent() {
  const router = useLocalizedRouter();
  
  const handleClick = () => {
    // Automatically adds locale prefix
    router.push('/dashboard');
  };
  
  const switchToArabic = () => {
    router.switchLocale('ar');
  };
  
  return (
    <div>
      <button onClick={handleClick}>Go to Dashboard</button>
      <button onClick={switchToArabic}>Switch to Arabic</button>
    </div>
  );
}
```

### useTextDirection() & useIsRTL()

```tsx
import { useTextDirection, useIsRTL } from '@/lib/i18n/hooks';

function MyComponent() {
  const direction = useTextDirection(); // 'ltr' or 'rtl'
  const isRTL = useIsRTL(); // boolean
  
  return (
    <div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
      Content
    </div>
  );
}
```

## Helper Utilities

### getLocalizedPath()

```tsx
import { getLocalizedPath } from '@/lib/i18n/helpers';

const path = getLocalizedPath('/dashboard', 'ar'); // '/ar/dashboard'
```

### getLocalizedField()

For database content with locale-specific fields:

```tsx
import { getLocalizedField } from '@/lib/i18n/helpers';

const course = {
  titleEn: 'Introduction to React',
  titleAr: 'مقدمة في React',
  descriptionEn: '...',
  descriptionAr: '...'
};

const title = getLocalizedField(course, 'title', locale);
```

## RTL Support

### CSS Best Practices

Use **CSS logical properties** instead of directional properties:

```css
/* ❌ Bad */
.element {
  margin-left: 1rem;
  padding-right: 2rem;
  text-align: left;
}

/* ✅ Good */
.element {
  margin-inline-start: 1rem;  /* left in LTR, right in RTL */
  padding-inline-end: 2rem;   /* right in LTR, left in RTL */
  text-align: start;          /* left in LTR, right in RTL */
}
```

### Tailwind CSS RTL

Tailwind automatically handles RTL with logical utility classes:

```tsx
<div className="ms-4">  {/* margin-start: 1rem */}
  <button className="rounded-s-lg">  {/* rounded-start */}
    {t('save')}
  </button>
</div>
```

### Manual RTL Handling

When needed, use the `dir` attribute:

```tsx
<div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
  {/* Content automatically flows in the correct direction */}
</div>
```

## Locale Switching

The locale switcher is available in the navbar:

```tsx
import { LocaleSwitcher } from '@/components/locale-switcher';

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <LocaleSwitcher />
    </nav>
  );
}
```

Users can switch between English and Arabic, and the application will:
1. Update the URL with the new locale prefix
2. Reload the page with the new locale
3. Apply RTL layout for Arabic
4. Use Arabic fonts (Cairo & Noto Sans Arabic)

## SEO and Metadata

### Page-Level Metadata

Generate locale-specific metadata:

```tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        'en': '/en',
        'ar': '/ar',
      },
    },
    openGraph: {
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
    },
  };
}
```

## Testing

### Testing Components with Translations

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

describe('MyComponent', () => {
  it('renders in English', () => {
    const messages = { 
      common: { welcome: 'Welcome' } 
    };
    
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MyComponent />
      </NextIntlClientProvider>
    );
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
  
  it('renders in Arabic', () => {
    const messages = { 
      common: { welcome: 'مرحباً' } 
    };
    
    render(
      <NextIntlClientProvider locale="ar" messages={messages}>
        <MyComponent />
      </NextIntlClientProvider>
    );
    
    expect(screen.getByText('مرحباً')).toBeInTheDocument();
  });
});
```

## Checklist for New Features

When adding a new feature:

- [ ] Add translation keys to `locales/en/*.json`
- [ ] Add Arabic translations to `locales/ar/*.json`
- [ ] Use `useTranslations()` hook in components
- [ ] Replace all hardcoded strings with translation keys
- [ ] Test with both locales
- [ ] Verify RTL layout for Arabic
- [ ] Check that dates and numbers format correctly
- [ ] Update this documentation if adding new patterns

## Common Issues

### Issue: Translation key not found

**Error:** `[next-intl] Could not resolve translation key`

**Solution:** Ensure the key exists in the translation file and you're using the correct namespace.

### Issue: RTL layout broken

**Solution:** Check that you're using logical CSS properties (`margin-inline-start` instead of `margin-left`).

### Issue: Arabic text appears disconnected

**Solution:** Ensure you're using Arabic-compatible fonts (Cairo or Noto Sans Arabic).

### Issue: Locale not updating

**Solution:** Check middleware configuration and ensure locale is in the URL path.

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Arabic Typography Best Practices](https://www.w3.org/International/articles/arabic-typography/)

## Component Internationalization Status

### ✅ Completed
- Core layout and routing
- Theme toggle
- Locale switcher
- Landing page (all sections)
- Navigation/navbar
- Translation infrastructure

### 📝 To Be Implemented
The following components need internationalization (framework is ready):

- **Authentication pages** (`app/[locale]/(auth)/`)
  - Login, register, forgot password, etc.
  - Use `auth.*` namespace from `common.json`

- **Hub components** (`app/[locale]/(hub)/hub/`)
  - Courses, social, events, jobs, chat
  - Create dedicated translation files as needed

- **Admin dashboard** (`app/[locale]/(admin)/admin/`)
  - User management, analytics, settings
  - Use `admin.*` namespace

- **Instructor dashboard** (`app/[locale]/(hub)/hub/instructor/`)
  - Course management, grading, analytics
  - Use `instructor.*` namespace

To internationalize these:
1. Create translation files in `locales/en/` and `locales/ar/`
2. Import and load them in `i18n.ts`
3. Use `useTranslations()` hook in components
4. Follow the patterns established in landing page components

## Contributing

When contributing new features:

1. **Never hardcode user-facing text**
2. Add translations for both English and Arabic
3. Use semantic translation keys
4. Test in both languages
5. Verify RTL layout
6. Update this guide if introducing new patterns
