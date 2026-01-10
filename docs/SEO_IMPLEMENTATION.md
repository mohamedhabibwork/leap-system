# SEO Implementation Guide

This document describes the comprehensive SEO implementation for LEAP LMS.

## Overview

The SEO implementation includes:

- ✅ **Metadata Management**: Title, description, keywords for all pages
- ✅ **OpenGraph Tags**: Rich social media previews (Facebook, LinkedIn)
- ✅ **Twitter Cards**: Optimized Twitter sharing
- ✅ **JSON-LD Structured Data**: Schema.org markup for search engines
- ✅ **Dynamic Sitemap**: Auto-generated XML sitemap with all public pages
- ✅ **Robots.txt**: Crawler directives and access control
- ✅ **Web Manifest**: PWA support with icons and theme
- ✅ **Canonical URLs**: Prevent duplicate content issues
- ✅ **SEO Debug Tool**: Development-only debugging component

## Architecture

### Core Files

```
apps/web/
├── lib/seo/
│   ├── config.ts           # Central SEO configuration
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Helper functions for metadata generation
│   └── metadata-api.ts     # Server-side data fetching for dynamic pages
├── app/
│   ├── layout.tsx          # Root layout with default metadata
│   ├── manifest.ts         # PWA web manifest
│   ├── robots.ts           # Dynamic robots.txt generation
│   └── sitemap.ts          # Dynamic XML sitemap generation
└── components/seo/
    └── seo-debug.tsx       # Development debugging tool
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Site Information
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=LEAP LMS
NEXT_PUBLIC_TWITTER_HANDLE=@leappm

# Search Engine Verification (Optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
NEXT_PUBLIC_BING_VERIFICATION=your-verification-code

# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### SEO Config

Edit `apps/web/lib/seo/config.ts` to customize:

- Site name and description
- Default keywords
- Social media handles
- Organization information
- Section-specific metadata

## Features by Page Type

### Static Pages

All static pages have metadata configured via layout files:

- **Auth Pages** (`/login`, `/register`, etc.): Basic metadata with noindex for privacy
- **Hub Pages** (`/hub/courses`, `/hub/social`, etc.): Rich metadata with relevant keywords
- **Instructor Pages**: Private dashboards with noindex
- **Admin Pages**: Restricted with noindex

### Dynamic Pages

Dynamic pages fetch data from the API to generate rich metadata:

#### Course Pages (`/hub/courses/[id]`)

- Dynamic title with course name and instructor
- Description from course content
- Course thumbnail as OpenGraph image
- JSON-LD Course schema with:
  - Course details (name, description, level)
  - Instructor information
  - Pricing and availability
  - Aggregate ratings
  - Duration
- Breadcrumb navigation schema

#### Lesson Pages (`/hub/courses/[id]/lessons/[lessonId]`)

- Title includes lesson and course name
- Lesson description
- VideoObject schema for video lessons
- Breadcrumb navigation schema

#### User Profiles (`/hub/users/[id]`)

- Profile name and bio
- Person schema with:
  - Name and description
  - Profile image
  - Role (instructor/student)
  - Organization affiliation
- Breadcrumb navigation schema

#### Group Pages (`/hub/social/groups/[id]`)

- Group name and description
- Member count and privacy status
- Cover image for social sharing
- Noindex for private groups
- Breadcrumb navigation schema

## Sitemap Generation

The sitemap (`/sitemap.xml`) is automatically generated and includes:

- **Static pages**: Homepage, auth pages, main hub pages
- **Dynamic course pages**: Fetched from API
- **Public user profiles**: Fetched from API (if enabled)

Priorities:
- Homepage: 1.0
- Course listing: 0.9
- Individual courses: 0.8
- Auth pages: 0.8
- Other pages: 0.6-0.7

## Robots.txt

The robots.txt (`/robots.txt`) is dynamically generated with:

- **Allowed**: All public pages
- **Disallowed**: 
  - `/api/*` - API endpoints
  - `/admin/*` - Admin panel
  - `/hub/chat/*` - Private messaging
  - `/hub/ads/new` - Ad creation
  - `/*?*` - URLs with query parameters (avoid duplicates)
- **Special**: Blocks GPTBot (OpenAI crawler) if desired
- **Environment-aware**: Blocks all crawlers in non-production

## Development Tools

### SEO Debug Component

In development mode, a floating debug panel is available:

1. Click the "SEO Debug" button (bottom-right corner)
2. View current page metadata:
   - Page title (with length validation)
   - Meta description (with length validation)
   - Canonical URL
   - Robots directives
   - OpenGraph tags
   - Twitter Card tags
   - JSON-LD schemas (formatted with copy button)
3. Quick links to testing tools:
   - OpenGraph Debugger
   - Twitter Card Validator
   - Google Rich Results Test

The debug component automatically:
- Only renders in development mode
- Validates title/description lengths
- Formats JSON-LD for easy reading
- Provides copy-to-clipboard for schemas

## Testing Checklist

### Manual Testing

1. **View Page Source**
   - Right-click → View Page Source
   - Verify `<meta>` tags in `<head>`
   - Check JSON-LD `<script>` tags

2. **OpenGraph Validation**
   - Visit https://www.opengraph.xyz/
   - Enter your page URL
   - Verify image, title, description display correctly

3. **Twitter Card Validation**
   - Visit https://cards-dev.twitter.com/validator
   - Enter your page URL
   - Verify card displays correctly

4. **Google Rich Results**
   - Visit https://search.google.com/test/rich-results
   - Enter your page URL
   - Verify structured data is valid

5. **Sitemap Validation**
   - Visit `/sitemap.xml`
   - Verify all pages are listed
   - Check priorities and update frequencies

6. **Robots.txt Validation**
   - Visit `/robots.txt`
   - Verify allowed/disallowed paths
   - Confirm sitemap reference

7. **Web Manifest**
   - Visit `/manifest.json`
   - Verify icons and theme colors
   - Test PWA installation (optional)

### Automated Testing

Check for:
- Title length: 50-60 characters (ideal)
- Description length: 120-160 characters (ideal)
- All pages have unique titles
- All pages have unique descriptions
- Images have alt text
- Structured data validates with Google

### Page-Specific Testing

| Page Type | Check |
|-----------|-------|
| Homepage | Organization schema, default OG image |
| Courses | Course schema, instructor info, ratings |
| Lessons | VideoObject schema (if video), breadcrumbs |
| User Profiles | Person schema, profile image |
| Groups | Noindex for private groups |
| Admin | Noindex on all admin pages |

## Common Issues & Solutions

### Issue: Metadata not updating

**Solution**: 
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- For dynamic pages, check API response

### Issue: Images not showing in social previews

**Solution**:
- Verify image URLs are absolute (include domain)
- Check image dimensions (1200x630 for OG)
- Ensure images are accessible (not behind auth)
- Use SVG images carefully (some platforms don't support)

### Issue: JSON-LD validation errors

**Solution**:
- Use Google Rich Results Test for detailed errors
- Check schema type matches content
- Ensure all required fields are present
- Validate JSON syntax

### Issue: Sitemap not generating

**Solution**:
- Check API endpoints are accessible
- Verify environment variables are set
- Check server logs for errors
- Test metadata API functions directly

## Production Deployment

Before deploying:

1. **Update Environment Variables**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   NODE_ENV=production
   ```

2. **Build and Test**
   ```bash
   npm run build
   npm run start
   ```

3. **Verify Production Settings**
   - Check robots.txt allows crawlers
   - Verify canonical URLs use production domain
   - Test all meta tags with production URLs

4. **Submit to Search Engines**
   - Google Search Console: Submit sitemap
   - Bing Webmaster Tools: Submit sitemap
   - Monitor indexing status

5. **Monitor Performance**
   - Use Google Search Console for crawl errors
   - Check OpenGraph cache refresh (Facebook Debugger)
   - Monitor Core Web Vitals

## Brand Assets

Replace placeholder images in `apps/web/public/images/seo/`:

- `og-default.svg` → Replace with 1200x630 PNG branded image
- `logo.svg` → Replace with your logo (512x512)
- `icon-192.svg` → Replace with PWA icon (192x192)
- `icon-512.svg` → Replace with PWA icon (512x512)
- `twitter-card.svg` → Replace with 1200x600 PNG for Twitter

Current placeholders are SVG with LEAP LMS branding.

## Performance Considerations

- Metadata API calls are cached for 1 hour
- Sitemap generation has timeout protection (5s per API call)
- Failed API calls fallback to default metadata
- JSON-LD schemas are minimized (no unnecessary whitespace in production)

## Support & Resources

- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central](https://developers.google.com/search/docs)

## Future Enhancements

Consider adding:
- [ ] Multi-language support (hreflang tags)
- [ ] Article schema for blog posts
- [ ] FAQ schema for help pages
- [ ] Review schema for course reviews
- [ ] Event schema for webinars/sessions
- [ ] Breadcrumb UI component (visual)
- [ ] Automated SEO testing in CI/CD
- [ ] Performance monitoring dashboard
