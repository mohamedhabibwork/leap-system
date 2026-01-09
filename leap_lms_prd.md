# Learning Management System (LMS) - Product Requirements Document

## 1. Executive Summary

A comprehensive Learning Management System with integrated social networking, content management, events, support ticketing, subscription plans, and real-time chat capabilities. The system supports three user roles: Admin, User (Student), and Instructor with flexible subscription-based and one-time purchase options.

## 2. System Overview

### 2.1 Core Modules
- **LMS Module**: Course management with hierarchical structure (Course → Section → Lesson), resources, enrollments, assignments, quizzes, and grading
- **Social Module**: Posts, groups, pages, friend connections with commenting everywhere
- **CMS Module**: Multi-language landing page management (Arabic & English)
- **Events Module**: Event creation, registration, attendance tracking, and management
- **Jobs Module**: Job posting, application, and recruitment management
- **Ticketing Module**: Contact us and reporting system for all entities
- **Subscription Module**: Plans with features and subscription management
- **Chat Module**: Public and private messaging system
- **Favorites Module**: Universal favoriting system for courses, posts, events, pages, groups, jobs
- **Sharing Module**: Content sharing across the platform
- **Audit Module**: Comprehensive activity logging and tracking system

### 2.2 User Roles
- **Admin**: Full system access, user management, content moderation, subscription management, audit log access
- **Instructor**: Course creation, student management, grading, chat with students, certificate generation
- **Recruiter** (Optional): Job posting, application management, candidate communication
- **User (Student)**: Course enrollment (purchase or subscription), social interactions, event participation, job applications, chat access, content downloads

## 3. Detailed Requirements

### 3.1 LMS Module

#### 3.1.1 Course Structure (Hierarchical)
- **Course** → **Sections** → **Lessons** → **Content Items**
- Course contains multiple sections (modules/chapters)
- Each section contains multiple lessons
- Each lesson can have: videos, documents, quizzes, assignments
- Course prerequisites and sequencing
- Course visibility settings (public, private, draft)
- Course can be purchased individually or accessed via subscription

#### 3.1.2 Course Resources
- **Global Course Resources**: Available for entire course
- **Section-Level Resources**: Specific to a section
- **Lesson-Level Resources**: Specific to a lesson
- Resource types: PDFs, documents, videos, links, downloadable files
- Resource access control based on enrollment/subscription

#### 3.1.3 Learning Content
- **Lessons**: Video, text, embedded content, downloadable resources
- **Assignments**: File submissions, deadlines, grading rubrics
- **Quizzes**: Multiple choice, true/false, short answer, essay questions
- Question banks for reusable questions
- Time limits and attempts configuration
- Comments and notes on all content items

#### 3.1.4 Enrollment System
- **Purchase Options**:
  - One-time purchase: Lifetime access to course
  - Subscription-based: Access while subscription is active
- Enrollment expires when subscription ends (unless purchased)
- Purchased courses remain accessible forever
- Progress tracking continues regardless of enrollment type

#### 3.1.5 Progress Tracking
- Lesson completion tracking
- Quiz scores and attempts
- Assignment submissions and grades
- Course completion certificates
- Learning analytics and reports
- Time spent tracking per lesson/course

#### 3.1.6 Comments and Notes
- **Comments**: Public discussions on courses, sections, lessons, assignments, quizzes
- **Notes**: Personal or shared annotations on any content
  - **Private notes**: Only visible to the note creator
  - **Public notes**: Visible to all enrolled students
  - **Instructor-only notes**: Visible to instructors only
  - Note features:
    - Color coding/highlighting
    - Pin important notes
    - Archive old notes
    - Like public notes
    - Timestamp and edit history
- Instructor responses to comments
- Comment moderation and flagging
- Rich text formatting support
- Note visibility control via lookup system

### 3.2 Subscription Module

#### 3.2.1 Plans and Features
- Multiple subscription tiers (Basic, Premium, Enterprise)
- Plan features defined using lookup system
- Features may include:
  - Number of courses accessible
  - Access to premium content
  - Chat privileges
  - Download limits
  - Certificate access
  - Priority support
  - Event registration limits

#### 3.2.2 Subscription Management
- Monthly, quarterly, annual billing cycles
- Subscription start and end dates
- Auto-renewal settings
- Payment history tracking
- Plan upgrades/downgrades
- Grace period handling
- Cancellation and refund policies

#### 3.2.3 Access Control
- Course access based on subscription status
- Feature gating based on plan
- Enrollment type tracking (subscription vs purchase)
- Access revocation on subscription expiry
- Grandfathering for purchased content

### 3.3 Social Module

#### 3.3.1 Posts
- Create, edit, delete posts
- Post types: text, image, video, link
- Comments on posts (nested/threaded)
- Reactions on posts
- Post visibility settings
- Share posts to timeline, groups, or pages
- Report inappropriate posts

#### 3.3.2 Groups
- Create public/private groups
- Group member roles: Owner, Moderator, Member
- Group-specific posts and discussions
- Member management (invite, approve, remove)
- Group settings and rules
- Group search and discovery
- Comments on group posts
- Group chat functionality

#### 3.3.3 Pages
- Create professional/business pages
- Page member roles: Owner, Admin, Editor, Viewer
- Page posts and updates
- Page likes and followers
- Follow/unfollow functionality
- Page analytics (likes count, follower growth)
- Comments on page posts

#### 3.3.4 Friends System
- Send/receive friend requests
- Accept/decline/block functionality
- Friends list management
- Friend suggestions based on mutual connections
- Privacy settings for friend visibility
- Private chat with friends

#### 3.3.5 Universal Commenting
- Comments on: courses, sections, lessons, posts, events, pages, groups
- Nested/threaded comment support
- Comment reactions and replies
- Comment moderation
- Comment notifications

### 3.4 Chat Module

#### 3.4.1 Public Chat
- Public chat rooms for courses
- Group chat within groups
- Event-based chat rooms
- Chat moderation tools
- Message history
- File sharing in chat

#### 3.4.2 Private Chat
- One-on-one messaging between users
- Friend-to-friend chat
- Instructor-student private messaging
- Read receipts and typing indicators
- Message search and filtering
- Chat history retention

#### 3.4.3 Chat Features
- Real-time messaging
- Emoji and reactions support
- File and image sharing
- Voice message support
- Message editing and deletion
- Mute and block functionality
- Online/offline status
- Last seen tracking

### 3.5 Favorites Module

#### 3.5.1 Universal Favoriting
- Favorite any entity: courses, posts, events, pages, groups
- Personal favorites collection
- Quick access to favorited items
- Favorite counts per item
- Remove from favorites
- Favorite activity notifications

#### 3.5.2 Organization
- Categorized favorites view
- Sort favorites by date added
- Search within favorites
- Export favorites list

### 3.6 Sharing Module

#### 3.6.1 Shareable Content
- Share courses (with affiliate/referral tracking)
- Share posts to own timeline or groups
- Share events to social platforms
- Share pages and groups
- Internal sharing within platform
- External sharing (social media, email, link copy)

#### 3.6.2 Share Tracking
- Share count tracking
- Share analytics
- Referral attribution
- Social proof display
- Share notifications

### 3.7 CMS Module

#### 3.7.1 Multi-language Support
- Arabic and English language support via Lookups system
- Language-specific content stored in JSON format
- Language switching functionality
- RTL support for Arabic
- Translations stored per entity: `{en: {title, content, ...}, ar: {title, content, ...}}`
- Timezone management via Lookups

#### 3.7.2 Landing Page Management
- Dynamic page builder with JSON sections
- Page components:
  - Hero sections
  - Feature highlights
  - Course showcase
  - Testimonials
  - FAQ sections
  - Call-to-action sections
  - Subscription plans display
  - Footer with links and information
- Section-based architecture with customizable settings
- All content translations in single JSON field
- SEO metadata for each page

#### 3.7.3 SEO Management
- Per-page SEO settings in JSON format
- SEO fields include:
  - Meta title (per language)
  - Meta description (per language)
  - Keywords/tags
  - Open Graph tags (og:title, og:description, og:image, etc.)
  - Schema.org markup (JSON-LD)
  - Canonical URLs
  - Social media cards
- Automatic sitemap generation
- Robots.txt management
- SEO-friendly URLs (slugs)

### 3.8 Events Module

#### 3.8.1 Event Management
- Create online/in-person/hybrid events
- Event details: title, description, date, time, location, timezone
- Event capacity and registration limits
- Event categories and tags
- Event visibility settings
- Comments on events
- Event chat rooms
- Event sharing and favoriting
- View count tracking

#### 3.8.2 Event Registration
- User registration for events
- Registration restrictions based on subscription plan
- Registration status tracking
- Waitlist management
- Registration confirmation emails
- Attendance tracking (attended/not attended)

#### 3.8.3 Event Attendance Status
- **Going**: User confirmed attendance
- **Interested**: User is interested but not committed
- **Maybe**: User is undecided
- **Not Going**: User declined attendance
- Attendance counts displayed per event
- Users can update their attendance status
- Notifications for status changes

### 3.9 Jobs Module

#### 3.9.1 Job Posting
- Create and manage job postings
- Job details: title, description, requirements, responsibilities
- Multi-language support (Arabic & English)
- Job types: Full-time, Part-time, Contract, Freelance
- Experience levels: Entry, Mid, Senior
- Location and salary range
- Application deadline
- Job categories
- Company association (link to Pages)
- Featured jobs

#### 3.9.2 Job Application
- Users can apply for jobs
- Application components:
  - Cover letter
  - Resume/CV upload
  - Portfolio links
- Application status tracking:
  - Applied
  - Under Review
  - Shortlisted
  - Rejected
  - Accepted
- Application history for users
- Withdraw application option

#### 3.9.3 Job Management (Recruiters/Admins)
- Review applications
- Change application status
- Add internal notes
- Track application metrics
- Filter and search applications
- Export applicant data
- Communication with applicants

#### 3.9.4 Job Discovery
- Browse jobs with filters:
  - Job type
  - Experience level
  - Location
  - Salary range
  - Company
- Search functionality
- Favorite jobs
- Share jobs
- View count tracking
- Application count display
- Comments on job postings

### 3.10 Ticketing Module

#### 3.10.1 Contact Us System
- Contact form for general inquiries
- Ticket categories: Technical, Billing, General, Content
- Ticket priority levels: Low, Medium, High, Urgent
- Automated ticket assignment
- Email notifications
- Soft delete support

#### 3.10.2 Reporting System
- Report any entity: posts, pages, users, groups, courses, comments, chat messages, jobs
- Report types (using lookup)
- Report status tracking
- Moderator dashboard for report management
- Admin notes and actions
- Soft delete support

### 3.11 Downloads Module

#### 3.11.1 Invoice Downloads
- Download payment invoices
- Invoice generation with unique invoice number
- PDF format with company branding
- Invoice history tracking
- Invoice details:
  - Payment date
  - Amount paid
  - Payment method
  - Transaction ID
  - Plan details
- Email invoice to user
- Soft delete support

#### 3.11.2 Certificate Downloads
- Download course completion certificates
- Unique certificate number per certificate
- PDF format with course and user details
- Certificate includes:
  - Course name
  - Completion date
  - Student name
  - Certificate number
  - Digital signature/seal
- Download count tracking
- Share certificate functionality
- Verification system via certificate number
- Soft delete support

#### 3.11.3 Resource Downloads
- Download course materials and resources
- Track download count per resource
- Access control based on enrollment
- Support multiple file types:
  - PDFs
  - Documents (Word, Excel, PowerPoint)
  - Videos
  - Archives (ZIP)
- Soft delete support

### 3.12 Media Storage Module

#### 3.12.1 Unified Storage System
- Centralized media library for all file uploads
- Support for multiple storage providers (via Lookups):
  - Local filesystem
  - Amazon S3
  - MinIO
  - Cloudflare R2
  - Backblaze B2
  - Custom providers
- Automatic provider selection based on configuration
- Provider failover and redundancy support

#### 3.12.2 Temporary Uploads
- Upload files before entity creation
- Temporary storage with expiration:
  - Default: 24-hour retention
  - Configurable cleanup schedule
- Files marked as `is_temporary = true`
- Auto-cleanup job removes expired temp files
- Convert to permanent on entity association

#### 3.12.3 File Management
- File properties tracking:
  - Original filename
  - File type and MIME type
  - File size
  - Image dimensions (width/height)
  - EXIF data in metadata JSON
- Polymorphic relationships (mediable_type/mediable_id):
  - Course materials
  - User avatars
  - Post media
  - Event banners
  - Job attachments
  - Chat attachments
  - Temporary/unattached files
- Alt text for accessibility
- Download count tracking
- Soft delete support

#### 3.12.4 File Operations
- Upload with validation (file type, size limits)
- Image processing (resize, crop, thumbnails)
- Secure file serving with access control
- CDN integration
- Direct upload to storage (presigned URLs)
- Bulk upload support
- File versioning (optional)

#### 3.12.5 Security
- Access control based on entity permissions
- Temporary signed URLs for downloads
- Virus scanning integration
- File type validation
- Size restrictions per entity type
- IP-based rate limiting
- Encryption at rest (storage provider dependent)

### 3.13 Audit Module

#### 3.13.1 Activity Logging
- Comprehensive audit trail for all system actions
- Track actions: create, update, delete, view, download
- Log for all major entities:
  - Users
  - Courses
  - Posts
  - Jobs
  - Events
  - Payments
  - Subscriptions
  - Applications
- Capture old and new values (JSON format)
- Action description and context

#### 3.13.2 Audit Details
- User identification (who performed the action)
- System actions (automated processes)
- Timestamp (when action occurred)
- IP address tracking
- User agent (browser/device information)
- Entity type and ID (what was affected)
- Before/after state comparison
- Searchable audit trail

#### 3.13.3 Audit Use Cases
- Security investigations
- Compliance requirements
- User activity monitoring
- System debugging
- Change history tracking
- Data recovery support
- Analytics and reporting
- Admin oversight

### 3.14 Lookup Types and Lookups System

#### 3.14.1 Lookup Type Categories
- **User Roles**: Admin, Instructor, User, Recruiter
- **User Status**: Active, Inactive, Suspended, Banned
- **Course Status**: Draft, Published, Archived
- **Enrollment Type**: Purchase, Subscription
- **Enrollment Status**: Active, Completed, Expired, Dropped
- **Post Types**: Text, Image, Video, Link
- **Group Roles**: Owner, Moderator, Member
- **Group Privacy**: Public, Private, Secret
- **Page Roles**: Owner, Admin, Editor, Viewer
- **Event Types**: Online, In-Person, Hybrid
- **Event Status**: Upcoming, Ongoing, Completed, Cancelled
- **Event Attendance Status**: Going, Interested, Maybe, Not Going
- **Job Types**: Full-time, Part-time, Contract, Freelance, Internship
- **Experience Levels**: Entry Level, Mid Level, Senior Level, Executive
- **Job Status**: Open, Closed, Filled, On Hold
- **Job Application Status**: Applied, Under Review, Shortlisted, Interview Scheduled, Rejected, Accepted, Withdrawn
- **Ticket Categories**: Technical, Billing, General, Content, Job Related
- **Ticket Status**: Open, In Progress, Waiting, Resolved, Closed
- **Ticket Priority**: Low, Medium, High, Urgent
- **Report Types**: Spam, Harassment, Inappropriate, Copyright, Fake Job, Other
- **Report Status**: Pending, Under Review, Resolved, Dismissed
- **Languages**: Arabic (ar), English (en) - Managed via Lookups, not separate table
- **Timezones**: UTC, Cairo, Dubai, Riyadh, etc.
- **Quiz Question Types**: Multiple Choice, True/False, Short Answer, Essay
- **Assignment Status**: Not Submitted, Submitted, Graded
- **Friend Request Status**: Pending, Accepted, Declined, Blocked
- **Subscription Status**: Active, Expired, Cancelled, Suspended, Trial
- **Billing Cycles**: Monthly, Quarterly, Annual
- **Plan Features**: Course Access, Chat Access, Downloads, Certificates, Priority Support, Job Postings
- **Chat Types**: Public, Private, Group
- **Message Types**: Text, Image, File, Voice
- **Message Status**: Sent, Delivered, Read
- **Reaction Types**: Like, Love, Celebrate, Insightful, Curious
- **Content Types**: Video, Document, Quiz, Assignment, Text
- **Resource Types**: PDF, Video, Document, Link, File, Archive
- **Notification Types**: Enrollment, Message, Comment, Like, Share, Friend Request, Job Application, Event Reminder
- **Payment Status**: Pending, Completed, Failed, Refunded
- **Audit Actions**: Created, Updated, Deleted, Viewed, Downloaded, Logged In, Logged Out
- **Storage Providers**: Local, Amazon S3, MinIO, Cloudflare R2, Backblaze B2, Custom
- **Note Visibility**: Private, Public, Instructors Only

#### 3.14.2 Lookup Enhancement Features
- **Language support**: Each lookup can have translations (AR/EN) via name_en and name_ar fields
- **Timezone support**: Store timezone information for date-related lookups
- **Hierarchical structure**: Parent-child relationships for nested lookups
- **Flexible metadata**: JSON metadata field for additional custom properties
- **Sort ordering**: sort_order and display_order fields for custom arrangement
- **Soft delete**: isDeleted flag and deletedAt timestamp for data retention
- **Code system**: Unique code field for programmatic reference
- **Active status**: isActive flag for enabling/disabling lookups without deletion
- **Lookup Type hierarchy**: Parent-child relationships in lookup types themselves
- **Extensibility**: Easy to add new lookup types without schema changes

## 4. Technical Requirements

### 4.1 SEO (Search Engine Optimization)

#### 4.1.1 Universal SEO Implementation
- SEO metadata stored as JSON in all public-facing entities:
  - Courses
  - Events
  - Jobs
  - Groups
  - Pages
  - CMS Pages
  - Posts (optional)
- SEO JSON structure:
```json
{
  "en": {
    "meta_title": "Custom Page Title",
    "meta_description": "Description for search engines",
    "keywords": ["keyword1", "keyword2"],
    "og_title": "Title for Open Graph",
    "og_description": "Description for social shares",
    "og_image": "URL to social share image",
    "og_type": "website/article/etc",
    "schema_markup": {...},
    "canonical_url": "https://example.com/canonical"
  },
  "ar": {
    ...
  }
}
```

#### 4.1.2 SEO Features
- Automatic meta tag generation
- Open Graph protocol support
- Twitter Card support
- Schema.org structured data (JSON-LD)
- Canonical URL management
- XML sitemap generation
- Robots.txt customization
- SEO-friendly URL slugs (unique per entity)
- 301 redirects for slug changes
- Alt text for all images
- Page speed optimization
- Mobile-friendly responsive design

#### 4.1.3 SEO Best Practices
- Unique title and description per page
- Proper heading hierarchy (H1, H2, etc.)
- Image optimization with alt text
- Internal linking strategy
- Breadcrumb navigation
- Rich snippets support
- Social media sharing optimization
- Multilingual SEO (hreflang tags)

### 4.2 Data Management
- All primary keys: BIGINT with auto-increment
- UUID field for all entities (for external references/APIs)
- Timestamp with timezone (timestamptz) for all datetime fields
- Relational database structure
- Proper indexing for performance
- Data validation and constraints
- **Soft delete for all entities**: 
  - `isDeleted` boolean flag (default: false)
  - `deletedAt` timestamptz field (nullable)
  - Data retained in database but hidden from normal queries
  - Allows for data recovery and audit trails
- **Comprehensive audit logging**:
  - All CRUD operations logged
  - Before/after state captured in JSON format
  - User identification and IP tracking
  - Timestamp and action type recorded
  - Search and filter capabilities

### 4.3 Security
- Role-based access control (RBAC)
- Authentication and authorization
- Password encryption
- XSS and SQL injection prevention
- File upload validation and sanitization
- API rate limiting
- Subscription validation middleware
- Chat message encryption

### 4.4 Performance
- Caching strategy for frequently accessed data
- Pagination for large data sets
- Lazy loading for media content
- Database query optimization
- CDN for static assets
- Real-time chat optimization
- WebSocket connection pooling

### 4.5 Notifications
- Email notifications for key events
- In-app notifications
- Real-time chat notifications
- Notification preferences management
- Push notifications for mobile
- Subscription expiry reminders
- Job application status updates
- Event attendance reminders
- Invoice generation notifications
- Certificate availability notifications
- Soft delete support for notification history

## 5. User Permissions Matrix

### Admin
- Full system access
- Subscription plan management
- User management (create, edit, delete, suspend, restore)
- Course moderation and management
- Content moderation
- Report review and action
- System settings and configuration
- Analytics and reporting access
- Chat monitoring and moderation
- Job posting approval and management
- Access to full audit logs
- Soft delete and restore capabilities
- Invoice management
- Certificate management

### Instructor
- Create and manage own courses with sections and lessons
- Add resources at course, section, and lesson levels
- Enroll students in courses
- Grade assignments and quizzes
- View enrolled student progress
- Respond to comments and questions
- Private chat with enrolled students
- Access teaching analytics
- Course-level chat moderation
- Generate and manage course certificates
- View course-related audit logs

### Recruiter (Optional Role)
- Post and manage job listings
- Review job applications
- Update application status
- Access applicant resumes and cover letters
- Add internal notes to applications
- Communicate with applicants
- Access job-related analytics
- Manage company page (if linked)

### User (Student)
- Subscribe to plans or purchase courses individually
- Access courses based on subscription/purchase
- Complete lessons, assignments, quizzes
- Add private notes to content
- Comment on courses, sections, lessons
- Create and interact with social posts
- Join/create groups and pages
- Send friend requests and chat
- Register for events (based on subscription)
- Update event attendance status (going/interested/maybe/not going)
- Apply for jobs
- Track job application status
- Upload and manage resume
- Submit tickets and reports
- Favorite content (courses, posts, events, jobs)
- Share content
- Update own profile
- Download invoices
- Download certificates
- Download course resources
- View own activity audit logs

## 6. Data Schema Requirements

### 6.1 ID Standards
- Primary Key: `id BIGINT AUTO_INCREMENT`
- UUID: `uuid UUID NOT NULL UNIQUE` (generated on creation)
- All entities must have both id and uuid

### 6.2 Timestamp Standards
- Created: `createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- Updated: `updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()` (where applicable)
- Deleted: `deletedAt TIMESTAMPTZ NULL` (for soft deletes)
- All date/time fields use TIMESTAMPTZ
- Additional timestamps as needed: `published_at`, `completed_at`, `registered_at`, `applied_at`, etc.

### 6.3 Soft Delete Standards
- Boolean flag: `isDeleted BOOLEAN NOT NULL DEFAULT FALSE`
- Timestamp: `deletedAt TIMESTAMPTZ NULL`
- Applied to all major entities for data retention
- Queries should filter `isDeleted = FALSE` by default
- Restore capability through admin interface

### 6.4 Metadata Standards
- JSON/JSONB fields for flexible data: `metadata JSONB`
- Used in Lookups and LookupTypes for extensibility
- Stores additional properties without schema changes
- Examples:
  - Custom form fields
  - Integration settings
  - Display preferences
  - Feature flags

### 6.5 Foreign Key Standards
- Foreign keys reference BIGINT primary keys
- Use descriptive names: `userId`, `course_id`, `job_id`, etc.
- Cascade rules defined per relationship
- Self-referencing foreign keys for hierarchical data (parent_id)

## 7. Success Metrics

### 7.1 LMS Metrics
- Course completion rate by enrollment type
- Average quiz scores
- Assignment submission rate
- Student engagement time
- Instructor response time
- Resource download counts

### 7.2 Subscription Metrics
- Monthly recurring revenue (MRR)
- Subscription conversion rate
- Churn rate
- Customer lifetime value (LTV)
- Plan upgrade/downgrade rates
- Purchase vs subscription ratio

### 7.3 Social Metrics
- Daily active users
- Post engagement rate
- Comment activity
- Group participation
- Friend connections growth
- Share counts

### 7.4 Chat Metrics
- Active chat users
- Messages sent per day
- Average response time
- Chat engagement rate

### 7.5 Support Metrics
- Average ticket resolution time
- Report processing time
- Customer satisfaction score
- First response time

### 7.6 Jobs Metrics
- Total active job postings
- Application submission rate
- Time to hire
- Application conversion rate (applied → hired)
- Average applications per job
- Job view to application ratio
- Job sharing and favorite counts
- Recruiter response time

### 7.7 Event Metrics
- Event registration rate
- Attendance rate (registered vs attended)
- Attendance status distribution (going/interested/maybe)
- Event popularity (views, favorites, shares)
- Event cancellation rate

### 7.8 Downloads Metrics
- Invoice download count
- Certificate download count
- Resource download count
- Download by content type
- Most downloaded resources

### 7.9 Audit Metrics
- System activity volume
- User action patterns
- Security incident tracking
- Data modification frequency
- Most accessed entities
- Failed action attempts

## 8. Future Enhancements

### 8.1 Platform Enhancements
- Mobile applications (iOS/Android)
- Progressive Web App (PWA)
- Desktop application
- API for third-party integrations
- Webhooks for event notifications
- Advanced analytics dashboard with predictive analytics

### 8.2 LMS Enhancements
- Live streaming for courses
- Gamification and badges
- AI-powered course recommendations
- Adaptive learning paths
- Discussion forums
- Peer review system
- Course marketplace
- Certificate customization with templates
- Course bundling
- Learning paths and curricula

### 8.3 Jobs Enhancements
- AI-powered job matching (skills matching)
- Resume parsing and analysis
- Video interview integration
- Applicant tracking system (ATS) features
- Skill assessments and tests
- Salary benchmarking
- Job alerts and notifications
- Career development resources
- Employee referral system
- Integration with LinkedIn and other job boards

### 8.4 Communication Enhancements
- Voice/video calling in chat
- Screen sharing capabilities
- Collaborative whiteboards
- Video interviews for job applications
- Group video calls for events
- Live Q&A sessions
- Webinar functionality

### 8.5 Payment & Billing Enhancements
- Multiple payment gateway integration
- Cryptocurrency payment support
- Installment plans
- Promo codes and discounts
- Affiliate program
- Invoice customization
- Multi-currency support
- Tax calculation

### 8.6 Audit & Security Enhancements
- Advanced security monitoring
- Anomaly detection
- Real-time audit alerts
- Compliance reporting (GDPR, CCPA)
- Data export for compliance
- Two-factor authentication (2FA)
- Single Sign-On (SSO)
- Biometric authentication

### 8.7 Social & Engagement
- Stories feature
- Live streaming for posts
- Polls and surveys
- Events calendar integration
- Virtual event spaces
- Networking features
- Mentorship program
- Alumni network

### 8.8 Analytics & Reporting
- Advanced search with AI-powered filters
- Custom report builder
- Export capabilities for all reports
- Data visualization dashboards
- Predictive analytics
- A/B testing framework
- Heatmaps and user behavior tracking

## 9. Glossary

### Data & Technical Terms
- **BIGINT**: 64-bit integer data type for primary keys
- **UUID**: Universally Unique Identifier for external references
- **timestamptz**: Timestamp with timezone support
- **JSONB**: JSON Binary format for flexible metadata storage and translations
- **Soft Delete**: Marking records as deleted without physical removal using `isDeleted` flag and `deletedAt` timestamp
- **Audit Log**: Comprehensive tracking of all system actions and changes
- **Polymorphic Relationship**: Database relationship that can reference multiple entity types (e.g., mediable_type/mediable_id)
- **Temporary Upload**: File uploaded before being associated with an entity, with automatic cleanup

### System Concepts
- **Lookup Types**: Categories that define the types of lookup values
- **Lookups**: Predefined values used across the system for consistency
- **Hierarchical Lookups**: Parent-child relationships in lookup structure
- **Metadata**: Flexible JSON data for storing additional properties
- **RBAC**: Role-Based Access Control
- **RTL**: Right-to-Left (text direction for Arabic)

### Business Terms
- **MRR**: Monthly Recurring Revenue
- **LTV**: Lifetime Value
- **ATS**: Applicant Tracking System
- **SLA**: Service Level Agreement
- **Enrollment Type**: How a user gains access to a course (Purchase vs Subscription)
- **Attendance Status**: User's response to event invitation (Going/Interested/Maybe/Not Going)

### User Roles
- **Admin**: System administrator with full access
- **Instructor**: Course creator and teacher
- **Student/User**: Course learner and platform user
- **Recruiter**: Job poster and applicant manager (optional role)

### Module-Specific Terms
- **Course Section**: Module or chapter within a course
- **Lesson**: Individual learning unit within a section
- **Question Bank**: Reusable pool of quiz questions
- **Job Application**: User's submission to a job posting
- **Certificate Number**: Unique identifier for course completion certificates
- **Invoice Number**: Unique identifier for payment invoices
- **Audit Trail**: Chronological record of system activities

### Feature Terms
- **Favorite**: User-saved content for quick access
- **Share**: Content distribution within or outside platform
- **Reaction**: Emotional response to content (Like, Love, etc.)
- **Comment**: Public text discussion on any content
- **Note**: Private or public annotation on learning content with visibility control
- **Report**: Flag for inappropriate content
- **Ticket**: Support request or inquiry
- **SEO**: Search Engine Optimization metadata for better discoverability
- **Media Library**: Centralized storage system for all uploaded files
- **Storage Provider**: Backend service for file storage (S3, MinIO, etc.)
- **Slug**: URL-friendly unique identifier for entities