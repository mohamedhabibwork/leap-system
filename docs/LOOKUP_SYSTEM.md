# Lookup System Documentation

This document explains the lookup system used throughout the LEAP PM for managing system-wide reference data, enumerations, and configuration values.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Lookup Types](#lookup-types)
- [Usage in Code](#usage-in-code)
- [Best Practices](#best-practices)
- [Adding New Lookups](#adding-new-lookups)
- [Multilingual Support](#multilingual-support)

## Overview

The lookup system provides a centralized, database-driven approach to managing reference data across the application. Instead of hard-coding enum values, lookups are stored in the database, making them:

- **Flexible**: Easy to add or modify without code changes
- **Multilingual**: Support for multiple languages (English and Arabic)
- **Consistent**: Single source of truth for all reference data
- **Maintainable**: Changes don't require application deployment

### Key Benefits

1. **Database-driven**: No need to redeploy for new lookup values
2. **Bilingual**: Built-in support for English and Arabic
3. **Hierarchical**: Support for parent-child relationships
4. **Sortable**: Control display order with `sortOrder`
5. **Descriptive**: Include descriptions for clarity

## Database Schema

### lookup_types Table

Defines categories of lookups:

```sql
CREATE TABLE lookup_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'user_role'
  name VARCHAR(255) NOT NULL,                -- e.g., 'User Role'
  description TEXT,                          -- Human-readable description
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### lookups Table

Stores actual lookup values:

```sql
CREATE TABLE lookups (
  id SERIAL PRIMARY KEY,
  lookup_type_id INT REFERENCES lookup_types(id),
  code VARCHAR(100) NOT NULL,                -- e.g., 'admin'
  name_en VARCHAR(255) NOT NULL,             -- English name
  name_ar VARCHAR(255),                      -- Arabic name
  description_en TEXT,                       -- English description
  description_ar TEXT,                       -- Arabic description
  sort_order INT DEFAULT 0,                  -- Display order
  parent_id INT REFERENCES lookups(id),      -- For hierarchical data
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,                            -- Additional flexible data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lookup_type_id, code)
);
```

## Lookup Types

### User Management

#### user_role
User system roles:
- `admin` - System administrator
- `instructor` - Course instructor
- `user` - Regular user/student
- `recruiter` - Job recruiter

#### user_status
User account statuses:
- `active` - Account is active
- `inactive` - Account is inactive
- `suspended` - Account is temporarily suspended
- `banned` - Account is permanently banned

#### permission
CRUD permissions for all modules:
- `course.create`, `course.read`, `course.update`, `course.delete`
- `user.create`, `user.read`, `user.update`, `user.delete`
- `enrollment.create`, `enrollment.read`, etc.
- (Similar pattern for all modules)

### Course System

#### course_level
Course difficulty levels:
- `beginner` - Suitable for beginners
- `intermediate` - Requires basic knowledge
- `advanced` - For experienced learners

#### course_status
Course publication status:
- `draft` - Course is being prepared
- `published` - Course is live and available
- `archived` - Course is no longer active

#### enrollment_type
How users enroll in courses:
- `purchase` - One-time purchase
- `subscription` - Subscription-based access

#### enrollment_status
Student enrollment statuses:
- `active` - Currently enrolled
- `completed` - Successfully completed
- `expired` - Enrollment period expired
- `dropped` - Student dropped the course
- `cancelled` - Enrollment cancelled

### Social Features

#### post_type
Types of social posts:
- `text` - Text post
- `image` - Image post
- `video` - Video post
- `link` - Link sharing
- `poll` - Poll/survey

#### post_visibility
Who can see posts:
- `public` - Visible to everyone
- `private` - Visible to owner only
- `friends` - Visible to friends only
- `custom` - Custom visibility rules

#### group_role
Group member roles:
- `owner` - Group owner
- `moderator` - Group moderator
- `member` - Regular member

#### group_privacy
Group privacy settings:
- `public` - Anyone can join
- `private` - Request to join required
- `secret` - Invite only

#### reaction_type
Post reactions:
- `like` - Like
- `love` - Love
- `celebrate` - Celebrate
- `insightful` - Insightful
- `curious` - Curious

### Events

#### event_type
Event formats:
- `online` - Virtual event
- `in_person` - Physical location
- `hybrid` - Both online and in-person

#### event_status
Event lifecycle:
- `upcoming` - Event hasn't started
- `ongoing` - Event is currently happening
- `completed` - Event finished
- `cancelled` - Event was cancelled

#### event_attendance_status
User RSVP status:
- `going` - Will attend
- `interested` - Interested in attending
- `maybe` - Might attend
- `not_going` - Will not attend

### Jobs Module

#### job_type
Employment types:
- `full_time` - Full-time position
- `part_time` - Part-time position
- `contract` - Contract work
- `internship` - Internship

#### experience_level
Required experience:
- `entry` - Entry level
- `mid` - Mid level
- `senior` - Senior level
- `executive` - Executive level

#### job_status
Job posting status:
- `open` - Accepting applications
- `closed` - No longer accepting
- `filled` - Position filled
- `on_hold` - Temporarily paused

#### job_application_status
Application lifecycle:
- `applied` - Application submitted
- `under_review` - Being reviewed
- `shortlisted` - Selected for next round
- `interview_scheduled` - Interview scheduled
- `rejected` - Application rejected
- `accepted` - Application accepted
- `withdrawn` - Candidate withdrew

### Support System

#### ticket_category
Support ticket categories:
- `technical` - Technical issues
- `billing` - Billing inquiries
- `general` - General questions
- `content` - Content issues
- `job_related` - Job-related issues

#### ticket_status
Ticket lifecycle:
- `open` - New ticket
- `in_progress` - Being worked on
- `waiting` - Waiting for response
- `resolved` - Issue resolved
- `closed` - Ticket closed

#### ticket_priority
Urgency levels:
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent priority

#### report_type
Content reporting:
- `spam` - Spam content
- `harassment` - Harassment
- `inappropriate` - Inappropriate content
- `copyright` - Copyright violation
- `fake_job` - Fake job posting
- `other` - Other issues

### Content & Resources

#### content_type
Course content types:
- `video` - Video content
- `document` - Document
- `quiz` - Quiz/assessment
- `assignment` - Assignment
- `text` - Text content

#### resource_type
Downloadable resources:
- `pdf` - PDF file
- `video` - Video file
- `document` - Document file
- `link` - External link
- `file` - Generic file
- `archive` - Archive file (zip, etc.)

#### quiz_question_type
Question formats:
- `multiple_choice` - Multiple choice
- `true_false` - True/False
- `short_answer` - Short answer
- `essay` - Essay question

### System Configuration

#### language
Supported languages:
- `en` - English
- `ar` - Arabic

#### timezone
Supported timezones:
- `UTC` - Coordinated Universal Time
- `Africa/Cairo` - Cairo timezone
- `Asia/Dubai` - Dubai timezone
- `Asia/Riyadh` - Riyadh timezone

#### media_provider
Storage providers:
- `local` - Local storage
- `minio` - MinIO object storage
- `r2` - Cloudflare R2
- `s3` - AWS S3

#### payment_method
Payment options:
- `paypal` - PayPal
- `stripe` - Stripe
- `bank_transfer` - Bank transfer

#### payment_status
Payment lifecycle:
- `pending` - Payment pending
- `completed` - Payment completed
- `failed` - Payment failed
- `refunded` - Payment refunded

## Usage in Code

### Querying Lookups

```typescript
// Get all lookups of a specific type
const userRoles = await db
  .select({
    id: lookups.id,
    code: lookups.code,
    nameEn: lookups.nameEn,
    nameAr: lookups.nameAr,
  })
  .from(lookups)
  .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
  .where(eq(lookupTypes.code, 'user_role'))
  .orderBy(lookups.sortOrder);

// Get specific lookup by code
const [adminRole] = await db
  .select({ id: lookups.id })
  .from(lookups)
  .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
  .where(
    and(
      eq(lookupTypes.code, 'user_role'),
      eq(lookups.code, 'admin')
    )
  )
  .limit(1);

// Use in entities
await db.insert(users).values({
  email: 'user@example.com',
  roleId: adminRole.id, // Reference to lookup
  statusId: activeStatus.id,
  // ... other fields
});
```

### API Response with Lookups

```typescript
// Include lookup details in API response
async getUserWithRole(userId: number) {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      roleCode: lookups.code,
      roleName: lookups.nameEn,
    })
    .from(users)
    .leftJoin(lookups, eq(users.roleId, lookups.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

// Response:
{
  "id": 123,
  "email": "user@example.com",
  "roleCode": "instructor",
  "roleName": "Instructor"
}
```

### Multilingual Response

```typescript
// Return lookup in user's language
async getUserRole(userId: number, language: 'en' | 'ar') {
  const nameField = language === 'ar' ? lookups.nameAr : lookups.nameEn;
  
  const result = await db
    .select({
      roleName: nameField,
    })
    .from(users)
    .leftJoin(lookups, eq(users.roleId, lookups.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}
```

### Lookup Cache Service (Recommended)

```typescript
@Injectable()
export class LookupService {
  private cache = new Map<string, any>();

  async getLookupsByType(typeCode: string) {
    // Check cache
    if (this.cache.has(typeCode)) {
      return this.cache.get(typeCode);
    }

    // Query database
    const lookups = await this.db
      .select()
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(eq(lookupTypes.code, typeCode));

    // Cache results
    this.cache.set(typeCode, lookups);
    return lookups;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

## Best Practices

### 1. Use Descriptive Codes

❌ Bad:
```typescript
code: 'stat1', 'stat2', 'stat3'
```

✅ Good:
```typescript
code: 'active', 'inactive', 'suspended'
```

### 2. Always Provide Translations

❌ Bad:
```typescript
{
  nameEn: 'Active',
  nameAr: null  // Missing Arabic translation
}
```

✅ Good:
```typescript
{
  nameEn: 'Active',
  nameAr: 'نشط'  // Proper translation
}
```

### 3. Use Sort Order

```typescript
// Control display order
{
  code: 'urgent',
  nameEn: 'Urgent',
  sortOrder: 1  // Shows first
}
```

### 4. Add Descriptions

```typescript
{
  code: 'suspended',
  nameEn: 'Suspended',
  descriptionEn: 'Account is temporarily suspended due to policy violation',
  descriptionAr: 'الحساب معلق مؤقتاً بسبب انتهاك السياسة'
}
```

### 5. Cache Frequently Used Lookups

```typescript
// Cache in Redis or memory
// Lookups rarely change, perfect for caching
const userRoles = await this.cache.getOrSet(
  'lookups:user_role',
  () => this.getLookups('user_role'),
  3600 // 1 hour TTL
);
```

### 6. Reference by ID in Foreign Keys

❌ Bad:
```sql
CREATE TABLE users (
  role VARCHAR(50)  -- Storing code directly
);
```

✅ Good:
```sql
CREATE TABLE users (
  role_id INT REFERENCES lookups(id)  -- Foreign key to lookup
);
```

### 7. Validate Lookup References

```typescript
async createUser(data: CreateUserDto) {
  // Validate roleId exists
  const [role] = await db
    .select()
    .from(lookups)
    .where(eq(lookups.id, data.roleId))
    .limit(1);

  if (!role) {
    throw new BadRequestException('Invalid role ID');
  }

  // ... create user
}
```

## Adding New Lookups

### 1. Add to Seeder

Update `01-lookups.seeder.ts`:

```typescript
// Add new lookup type
const newType = await upsertLookupType(
  'new_type',
  'New Type',
  'Description of new type'
);

// Add lookup values
await upsertLookup({
  lookupTypeId: newType.id,
  code: 'value1',
  nameEn: 'Value 1',
  nameAr: 'القيمة 1',
  descriptionEn: 'Description',
  descriptionAr: 'الوصف',
  sortOrder: 1,
});
```

### 2. Run Seeder

```bash
npm run seed
```

### 3. Update TypeScript Types (Optional)

```typescript
// Create type-safe enum
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  USER = 'user',
  RECRUITER = 'recruiter',
}

// Use in code
const role = UserRole.ADMIN;
```

### 4. Update Documentation

Add the new lookup type to this document.

## Multilingual Support

### Language Selection

```typescript
// Get user's preferred language
const language = user.preferredLanguage || 'en';

// Select appropriate field
const nameField = language === 'ar' ? lookups.nameAr : lookups.nameEn;
const descField = language === 'ar' ? lookups.descriptionAr : lookups.descriptionEn;

const result = await db
  .select({
    code: lookups.code,
    name: nameField,
    description: descField,
  })
  .from(lookups);
```

### API Response Format

```json
{
  "lookups": [
    {
      "code": "admin",
      "name": {
        "en": "Admin",
        "ar": "مدير"
      },
      "description": {
        "en": "System administrator",
        "ar": "مدير النظام"
      }
    }
  ]
}
```

## Migration Path

### From Hard-Coded Enums

If you have existing hard-coded enums:

1. **Create lookup types and values** in seeder
2. **Add foreign key** to existing tables
3. **Migrate data**: Update existing records to reference lookups
4. **Remove old enum column** (after verification)
5. **Update code** to use lookup IDs

Example migration:

```typescript
// Old code
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// New code
// Reference lookup by ID instead
user.statusId = activeStatusLookup.id;
```

## See Also

- [Seeding Guide](./SEEDING.md)
- [Keycloak Sync Guide](./KEYCLOAK_SYNC.md)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)
