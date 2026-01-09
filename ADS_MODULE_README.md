# Ads Module Implementation

## Overview

The Ads module is a comprehensive advertising platform integrated into the LEAP LMS system. It supports multiple ad formats, advanced targeting, impression/click tracking, scheduling, and both paid and free promotional content.

## Features

### Ad Types
- **Banner Ads**: Horizontal/vertical image ads for prominent placement
- **Sponsored Content**: Native ads that blend with platform content
- **Pop-up Ads**: Modal ads with optional countdown timers
- **Video Ads**: Pre-roll video ads with skip functionality

### Targeting Capabilities
- **Role-based targeting**: Target by user role (admin, instructor, user)
- **Subscription-based targeting**: Target by subscription plan
- **Demographic targeting**: Age range, location, interests
- **Behavioral targeting**: Course enrollments, activity patterns

### Tracking & Analytics
- **Impression tracking**: Tracks when ads are shown (with 1-second visibility requirement)
- **Click tracking**: Tracks user interactions
- **CTR calculation**: Automatic click-through rate calculation
- **Fraud prevention**: IP-based rate limiting
- **Bulk insertion**: Optimized batch processing for high-volume tracking

### Ad Management
- **Campaign organization**: Group multiple ads into campaigns
- **Scheduling**: Start/end dates for ad display
- **Status management**: Draft, pending review, active, paused, completed
- **Permission control**: Subscription-based ad creation limits

## Database Schema

### Core Tables
- `ad_campaigns`: Campaign grouping and budget management
- `ads`: Main ads table with polymorphic relationships
- `ad_targeting_rules`: Advanced targeting configuration
- `ad_placements`: Define where ads can appear
- `ad_impressions`: Track ad views
- `ad_clicks`: Track ad interactions
- `ad_payments`: Track payments for paid ads

### Lookup Types
- Ad Types: Banner, Sponsored, Popup, Video
- Ad Status: Draft, Pending Review, Active, Paused, Completed, Rejected
- Placement Types: Homepage Banner, Course Sidebar, Between Content, etc.
- Payment Status: Pending, Completed, Failed, Refunded

## Backend Architecture

### NestJS Modules

#### AdsModule (`apps/backend/src/modules/ads/`)
- `ads.service.ts`: Core CRUD operations for ads
- `ad-campaigns.service.ts`: Campaign management
- `ads-tracking.service.ts`: Impression/click tracking with bulk insertions
- `ads-targeting.service.ts`: Targeting rule evaluation
- `ads.controller.ts`: REST API endpoints
- `ad-campaigns.controller.ts`: Campaign endpoints
- `ads-tracking.controller.ts`: Tracking endpoints

### Key Services

#### AdsService
```typescript
- create(createAdDto, userId): Create new ad
- findAll(query, userId): List ads with pagination
- findOne(id): Get ad details with targeting rules
- update(id, updateAdDto, userId, isAdmin): Update ad
- remove(id, userId, isAdmin): Soft delete ad
- pause(id, userId, isAdmin): Pause active ad
- resume(id, userId, isAdmin): Resume paused ad
- getAnalytics(id, userId, isAdmin): Get ad performance
- getActiveAds(placementCode, limit): Get active ads for display
```

#### AdsTrackingService
```typescript
- trackImpression(dto, ipAddress, userAgent): Track single impression
- trackBulkImpressions(dto, ipAddress, userAgent): Track multiple impressions
- trackClick(dto, ipAddress, userAgent): Track click
- getAdAnalytics(adId, startDate, endDate): Get detailed analytics
- Bulk insertion queue: Batches impressions every 30 seconds or 50 items
- Rate limiting: 100 impressions/min, 20 clicks/min per IP
```

#### AdsTargetingService
```typescript
- getTargetedAds(placementCode, userProfile, limit): Get ads for user
- evaluateTargeting(rules, userProfile): Check if user matches targeting
- validateTargetingRules(rules): Validate targeting configuration
- getRecommendedAds(userProfile, limit): Get personalized ad recommendations
```

### API Endpoints

#### Ads API (`/api/ads`)
- `POST /` - Create ad (requires subscription)
- `GET /` - List user's ads
- `GET /active` - Get active ads (public)
- `GET /:id` - Get ad details
- `PATCH /:id` - Update ad
- `DELETE /:id` - Delete ad
- `POST /:id/pause` - Pause ad
- `POST /:id/resume` - Resume ad
- `GET /:id/analytics` - Get ad analytics

#### Campaigns API (`/api/ads/campaigns`)
- `POST /` - Create campaign
- `GET /` - List campaigns
- `GET /:id` - Get campaign with ads
- `PATCH /:id` - Update campaign
- `DELETE /:id` - Delete campaign
- `GET /:id/analytics` - Get campaign analytics

#### Tracking API (`/api/ads/tracking`)
- `POST /impression` - Track impression
- `POST /impressions/bulk` - Bulk track impressions
- `POST /click` - Track click
- `GET /analytics/:adId` - Get analytics

#### Admin API (`/api/admin/ads`)
- `GET /pending` - Get pending ads
- `POST /:id/approve` - Approve ad
- `POST /:id/reject` - Reject ad
- `GET /analytics` - Platform-wide analytics

## Frontend Architecture

### Components (`apps/web/components/ads/`)

#### Display Components
- **AdBanner**: Banner ads with Intersection Observer tracking
- **AdSidebar**: Vertical sidebar ads with rotation
- **AdModal**: Pop-up ads with countdown timer
- **AdSponsoredContent**: Native sponsored content (card/inline variants)
- **AdVideoPreroll**: Video ads with skip functionality
- **AdContainer**: Wrapper that fetches and displays ads

### Usage Examples

```tsx
// Banner Ad
<AdContainer
  placement="homepage_hero"
  type="banner"
  width={728}
  height={90}
/>

// Sidebar Ad
<AdContainer
  placement="courses_sidebar"
  type="sidebar"
/>

// Sponsored Content
<AdSponsoredContent
  placement="social_feed"
  variant="card"
/>
```

### User Pages (`apps/web/app/(hub)/hub/ads/`)

#### Ad Management Dashboard (`/hub/ads`)
- List all user's ads
- View stats overview (impressions, clicks, CTR)
- Quick actions (pause, resume, edit, delete, analytics)

#### Create Ad Flow (`/hub/ads/new`)
Multi-step wizard:
1. Ad type selection
2. Target selection (internal content or external URL)
3. Ad content (title, description, media, CTA)
4. Targeting rules (optional demographics)
5. Placement selection
6. Scheduling (start/end dates, paid status)
7. Review and submit

#### Ad Analytics (`/hub/ads/[id]/analytics`)
- Key metrics (impressions, clicks, CTR, unique users)
- Daily performance charts
- Top performing placements

### Admin Pages (`apps/web/app/(admin)/admin/ads/`)

#### Admin Dashboard (`/admin/ads`)
- Pending ads review with approve/reject actions
- All ads overview with stats
- Platform-wide analytics
- Revenue tracking

## Ad Integration in Pages

### Home Page (`/`)
- Hero banner ad
- Between features section ad

### Course Listing (`/hub/courses`)
- Banner ad above course grid
- Sponsored course cards every 6 courses

### Events Page (`/hub/events`)
- Banner ad above events list

### Jobs Page (`/hub/jobs`)
- Banner ad above jobs list
- Sponsored job listings every 5 jobs

### Social Feed (`/hub/social`)
- Sponsored posts every 3 posts

## Tracking Implementation

### Client-Side Tracking (`lib/ads-tracking.ts`)

```typescript
// Track impression
trackAdImpression(adId, placementCode, metadata)

// Track click
trackAdClick(adId, placementCode, destinationUrl, metadata)

// Bulk track
trackBulkImpressions([{ adId, placementCode }, ...])
```

### Features
- Session ID generation/storage
- Automatic IP and user agent capture
- Error handling and silent failures
- Intersection Observer for visibility detection

## Performance Optimizations

### Backend
- Bulk insertion of impressions (30s batches or 50 items)
- Database indexes on:
  - Ad queries (placement, status, dates, target)
  - Tracking queries (ad_id, user_id, session_id, dates)
- Aggregate CTR calculation
- Rate limiting cache with Map

### Frontend
- Lazy loading of ad components
- Intersection Observer for impression tracking
- Client-side caching (SessionStorage for session ID)
- Debounced tracking calls

### Recommended (Future)
- Redis caching for active ads (5-minute TTL)
- CDN for ad media assets
- Database read replicas for analytics queries

## Security Considerations

### Backend
- JWT authentication required for ad creation/management
- Role-based access control (admin, instructor, user)
- Subscription validation for ad creation
- Admin approval required for paid/external ads
- Soft delete for data retention
- Audit logging for all ad operations

### Frontend
- XSS prevention (sanitized URLs and content)
- CSRF protection
- Rate limiting on tracking endpoints
- Input validation on all forms

### Fraud Prevention
- IP-based rate limiting:
  - Max 100 impressions per minute per IP
  - Max 20 clicks per minute per IP
- Session tracking for duplicate prevention
- 1-second visibility requirement for impressions

## Business Rules

### Ad Creation
- **Free users**: Cannot create ads
- **Paid users**: Can create ads (limits based on plan)
- **Internal ads**: Auto-approved
- **External ads**: Require admin approval
- **Paid ads**: Require admin approval

### Ad Display
- Ads must be Active status
- Current date must be between startDate and endDate
- Respect placement maxAds limit
- Priority ordering (higher priority first)
- Targeting rules must match (if specified)

### Impressions
- Counted only if ad visible for 1+ second
- Tracked per session (deduplicated)
- Bulk inserted for performance

### Clicks
- Linked to impressions when possible
- Update ad CTR automatically
- Track destination URL and referrer

## Testing Checklist

### Backend Tests
- [ ] Ad CRUD operations
- [ ] Campaign management
- [ ] Tracking service (impressions/clicks)
- [ ] Targeting evaluation
- [ ] Bulk insertion queues
- [ ] Rate limiting
- [ ] Permission guards
- [ ] Admin approval workflow

### Frontend Tests
- [ ] Ad display components render correctly
- [ ] Intersection Observer tracking works
- [ ] Click tracking fires
- [ ] Ad creation form validation
- [ ] Multi-step wizard navigation
- [ ] Analytics visualization
- [ ] Admin review interface

### Integration Tests
- [ ] End-to-end ad creation flow
- [ ] Ad display on all pages
- [ ] Tracking from display to analytics
- [ ] Admin approval workflow
- [ ] Subscription-based permissions

## Future Enhancements

### Features
- A/B testing for ad variations
- Conversion tracking (enrollment after click)
- Automated bidding for paid ads
- Real-time analytics dashboard
- Retargeting campaigns
- Integration with external ad networks
- VAST/VPAID video ad support
- Geographic targeting with maps
- Time-of-day scheduling

### Performance
- Redis caching layer
- ElasticSearch for ad search
- GraphQL API
- WebSocket for real-time updates
- Serverless functions for tracking
- CDN integration

### Analytics
- ML-powered performance predictions
- Audience insights and segmentation
- Competitive analysis
- Attribution modeling
- ROI calculation

## Deployment Notes

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# API
API_URL=http://localhost:3000

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Seed lookup data
npm run db:seed:ads
```

### Required Lookups
Add these lookup types and values:
- Ad Types (ad_types)
- Ad Status (ad_status)
- Placement Types (placement_types)
- Payment Status (payment_status)

## Support & Maintenance

### Monitoring
- Track ad performance metrics
- Monitor tracking API rate limits
- Alert on high error rates
- Track revenue and CTR trends

### Maintenance Tasks
- Clean up expired ads
- Archive old impressions/clicks data
- Optimize database indexes
- Review and approve pending ads
- Handle payment reconciliation

## Documentation
- API documentation: Swagger/OpenAPI at `/api/docs`
- Component documentation: Storybook
- Database schema: ERD diagrams
- Architecture diagrams: Mermaid charts

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
**Status**: Production Ready
