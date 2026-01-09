# SEO Testing & Validation Guide

## Quick Start

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open SEO Debug Panel**
   - Navigate to any page
   - Click "SEO Debug" button (bottom-right)
   - Review metadata, schemas, and tags

3. **Test Key Pages**
   - Homepage: `/`
   - Course listing: `/hub/courses`
   - Course detail: `/hub/courses/1` (example)
   - User profile: `/hub/users/1` (example)

## Page-by-Page Testing

### Homepage (`/`)

**Expected Metadata:**
- Title: "LEAP LMS - Modern Learning Management System | LEAP LMS"
- Description: Comprehensive description
- JSON-LD: Organization schema

**Validation:**
```bash
# View source
curl http://localhost:3001 | grep -A 5 'application/ld+json'

# Check title
curl http://localhost:3001 | grep '<title>'
```

**Manual Check:**
- [ ] Title appears in browser tab
- [ ] Description under 160 characters
- [ ] Organization schema includes logo, contact info
- [ ] OpenGraph image is default image

### Course Listing (`/hub/courses`)

**Expected Metadata:**
- Title: "Browse Courses | LEAP LMS"
- Description: About course catalog
- Keywords: online courses, e-learning, etc.

**Manual Check:**
- [ ] Title is descriptive
- [ ] Keywords relevant to courses
- [ ] No JSON-LD (listing page)

### Course Detail (`/hub/courses/[id]`)

**Expected Metadata:**
- Title: "[Course Title] | Learn with [Instructor Name] | LEAP LMS"
- Description: From course content
- Image: Course thumbnail
- JSON-LD: Course schema + Breadcrumb schema

**Test with API:**
```javascript
// Check if API returns course data
fetch('http://localhost:3000/api/courses/1/metadata')
  .then(r => r.json())
  .then(console.log)
```

**Manual Check:**
- [ ] Title includes course and instructor name
- [ ] Description from course (not generic)
- [ ] Course thumbnail used for OpenGraph
- [ ] Course schema includes:
  - [ ] Course name and description
  - [ ] Instructor information
  - [ ] Price/offers
  - [ ] Rating (if available)
  - [ ] Duration
- [ ] Breadcrumb schema has 3 items: Home → Courses → [Course]

### Lesson Page (`/hub/courses/[id]/lessons/[lessonId]`)

**Expected Metadata:**
- Title: "[Lesson] | [Course] | LEAP LMS"
- Description: Lesson description
- JSON-LD: Breadcrumb + VideoObject (if video)

**Manual Check:**
- [ ] Title hierarchy clear (Lesson → Course → Site)
- [ ] Breadcrumb has 4 items
- [ ] VideoObject schema present for video lessons
- [ ] VideoObject includes duration

### User Profile (`/hub/users/[id]`)

**Expected Metadata:**
- Title: "[Name] - Profile | LEAP LMS"
- Description: User bio or generic
- Image: User avatar
- JSON-LD: Person schema + Breadcrumb

**Manual Check:**
- [ ] Person schema includes name, role
- [ ] Image from user avatar
- [ ] Instructor profiles show "worksFor" org
- [ ] Public profiles are indexable

### Group Page (`/hub/social/groups/[id]`)

**Expected Metadata:**
- Title: "[Group Name] - Community Group | LEAP LMS"
- Description: Group description
- noindex: true for private groups
- JSON-LD: Breadcrumb

**Manual Check:**
- [ ] Private groups have noindex
- [ ] Public groups are indexable
- [ ] Cover image used for OpenGraph

### Admin Pages (`/admin/*`)

**Expected Metadata:**
- noindex: true (all admin pages)
- robots: noindex, nofollow

**Manual Check:**
- [ ] All admin pages have noindex
- [ ] robots.txt disallows /admin/*

### Auth Pages (`/login`, `/register`, etc.)

**Expected Metadata:**
- Basic metadata from auth layout
- Default keywords for auth section

**Manual Check:**
- [ ] All auth pages have appropriate titles
- [ ] Descriptions encourage signup/login

## Sitemap Testing

### Access Sitemap
```bash
curl http://localhost:3001/sitemap.xml | head -50
```

### Validate Sitemap
```bash
# Check XML is valid
curl http://localhost:3001/sitemap.xml | xmllint --format -

# Count URLs
curl http://localhost:3001/sitemap.xml | grep -c '<url>'
```

**Manual Check:**
- [ ] Sitemap is valid XML
- [ ] Homepage priority is 1.0
- [ ] Course listing priority is 0.9
- [ ] Individual courses priority is 0.8
- [ ] All public pages included
- [ ] No private/admin pages included

## Robots.txt Testing

### Access Robots.txt
```bash
curl http://localhost:3001/robots.txt
```

**Expected Output:**
```
User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /hub/chat/
...
Sitemap: http://localhost:3001/sitemap.xml
```

**Manual Check:**
- [ ] Sitemap URL is present
- [ ] Private areas are disallowed
- [ ] Public areas are allowed
- [ ] In production, not blocking all crawlers

## Web Manifest Testing

### Access Manifest
```bash
curl http://localhost:3001/manifest.json
```

**Manual Check:**
- [ ] name: "LEAP LMS"
- [ ] start_url: "/"
- [ ] display: "standalone"
- [ ] Icons array has 2 items (192, 512)
- [ ] theme_color is set
- [ ] Valid JSON

## Structured Data Validation

### Test with Google Rich Results
1. Go to: https://search.google.com/test/rich-results
2. Enter: `http://localhost:3001/hub/courses/1`
3. Verify no errors

### Common Schema Types

**Course Schema (`/hub/courses/[id]`)**
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "...",
  "description": "...",
  "provider": {
    "@type": "Organization",
    "name": "LEAP LMS"
  },
  "instructor": {
    "@type": "Person",
    "name": "..."
  },
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 100
  }
}
```

**Person Schema (`/hub/users/[id]`)**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "...",
  "description": "...",
  "image": "...",
  "jobTitle": "Instructor",
  "worksFor": {
    "@type": "Organization",
    "name": "LEAP LMS"
  }
}
```

## OpenGraph Testing

### Test with Debugger
1. Go to: https://www.opengraph.xyz/
2. Enter page URL
3. Verify preview

**Expected Tags:**
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="LEAP LMS" />
```

## Twitter Card Testing

### Test with Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter page URL
3. Verify card preview

**Expected Tags:**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@leaplms" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

## Automated Testing Script

Create `scripts/test-seo.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "Testing SEO Implementation..."
echo "=============================="

# Test homepage
echo -e "\n1. Homepage"
TITLE=$(curl -s $BASE_URL | grep -o '<title>[^<]*' | sed 's/<title>//')
echo "   Title: $TITLE"

# Test sitemap
echo -e "\n2. Sitemap"
SITEMAP_COUNT=$(curl -s $BASE_URL/sitemap.xml | grep -c '<url>')
echo "   URLs in sitemap: $SITEMAP_COUNT"

# Test robots.txt
echo -e "\n3. Robots.txt"
curl -s $BASE_URL/robots.txt | head -3

# Test manifest
echo -e "\n4. Web Manifest"
MANIFEST=$(curl -s $BASE_URL/manifest.json | jq -r '.name')
echo "   App name: $MANIFEST"

echo -e "\nDone!"
```

Run:
```bash
chmod +x scripts/test-seo.sh
./scripts/test-seo.sh
```

## Checklist Summary

- [ ] All pages have unique titles
- [ ] All pages have unique descriptions
- [ ] Title length: 50-60 characters
- [ ] Description length: 120-160 characters
- [ ] Images have absolute URLs
- [ ] Canonical URLs are correct
- [ ] Sitemap includes all public pages
- [ ] Robots.txt configured correctly
- [ ] JSON-LD schemas validate
- [ ] OpenGraph tags present
- [ ] Twitter Cards configured
- [ ] Web manifest valid
- [ ] Private pages have noindex
- [ ] Admin pages blocked in robots.txt
- [ ] SEO debug panel works in dev

## Troubleshooting

### Metadata not appearing
- Check Next.js cache: `rm -rf .next && npm run dev`
- Verify layout files are exported correctly
- Check for TypeScript errors

### API calls failing
- Verify API is running
- Check environment variables
- Test API endpoints directly

### Images not loading
- Use absolute URLs
- Check image accessibility
- Verify CORS if using external images

### Schemas not validating
- Use Google Rich Results Test
- Check JSON syntax
- Verify required fields present

## Production Testing

Before going live:

1. **Update URLs**
   - Change NEXT_PUBLIC_SITE_URL to production
   - Rebuild application

2. **Test on Staging**
   - Full SEO validation on staging URL
   - Verify social media previews

3. **Submit to Search Engines**
   - Google Search Console
   - Bing Webmaster Tools

4. **Monitor**
   - Check indexing status weekly
   - Review Core Web Vitals
   - Monitor crawl errors
