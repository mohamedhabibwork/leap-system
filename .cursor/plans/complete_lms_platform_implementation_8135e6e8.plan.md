---
name: Complete LMS Platform Implementation
overview: Build a comprehensive full-stack LMS platform with NestJS backend (REST/GraphQL/gRPC/WebSocket APIs) and Next.js 15 frontend, implementing ALL modules from the PRD including Authentication, LMS, Social, Events, Jobs, Chat, Subscriptions, Payments, Notifications, Media, Audit, and CMS with complete infrastructure setup.
todos:
  - id: monorepo-setup
    content: Setup Turborepo monorepo with apps/ and packages/ structure
    status: completed
  - id: infrastructure
    content: Create Docker Compose with PostgreSQL, Redis, Kafka, RabbitMQ, MinIO, Keycloak
    status: completed
    dependencies:
      - monorepo-setup
  - id: backend-scaffold
    content: Create NestJS backend app with CLI, core modules, guards, interceptors
    status: completed
    dependencies:
      - monorepo-setup
  - id: database-package
    content: Setup database package with Drizzle ORM and modular schemas
    status: completed
    dependencies:
      - monorepo-setup
  - id: auth-module
    content: Implement authentication with Keycloak OIDC, JWT strategies, guards
    status: completed
    dependencies:
      - backend-scaffold
      - infrastructure
  - id: lookups-module
    content: Implement Lookups module (foundation for all other modules)
    status: completed
    dependencies:
      - auth-module
      - database-package
  - id: users-module
    content: Implement Users module with CRUD, roles, profiles
    status: completed
    dependencies:
      - lookups-module
  - id: subscriptions-module
    content: Implement Subscriptions module (plans, features, subscriptions, payment history)
    status: completed
    dependencies:
      - users-module
  - id: payments-module
    content: Implement Payments module with PayPal integration and mock payment processing and invoice generation
    status: completed
    dependencies:
      - subscriptions-module
  - id: notifications-module
    content: Implement Notifications module with FCM, Email, Database channels
    status: completed
    dependencies:
      - users-module
  - id: media-module
    content: Implement Media module with S3/MinIO, temporary uploads
    status: completed
    dependencies:
      - users-module
  - id: lms-module
    content: Implement full LMS module (courses, sections, lessons, enrollments, assignments, quizzes, progress, certificates)
    status: completed
    dependencies:
      - subscriptions-module
      - media-module
  - id: comments-notes
    content: Implement Comments and Notes modules (universal)
    status: completed
    dependencies:
      - users-module
  - id: social-module
    content: Implement Social module (posts, groups, pages, friends)
    status: completed
    dependencies:
      - comments-notes
      - media-module
  - id: chat-module
    content: Implement Chat module with WebSocket (public/private messaging)
    status: completed
    dependencies:
      - users-module
  - id: events-module
    content: Implement Events module with registrations and attendance tracking
    status: completed
    dependencies:
      - users-module
      - media-module
  - id: jobs-module
    content: Implement Jobs module with applications and tracking
    status: completed
    dependencies:
      - users-module
      - media-module
  - id: favorites-shares
    content: Implement Favorites and Shares modules (universal)
    status: completed
    dependencies:
      - users-module
  - id: ticketing-module
    content: Implement Ticketing module (tickets, reports)
    status: completed
    dependencies:
      - users-module
  - id: cms-module
    content: Implement CMS module for landing pages
    status: completed
    dependencies:
      - media-module
  - id: audit-module
    content: Implement Audit module with comprehensive logging
    status: completed
    dependencies:
      - users-module
  - id: api-layers
    content: "Setup all API layers: REST, GraphQL, gRPC, WebSocket"
    status: completed
    dependencies:
      - lms-module
      - social-module
  - id: background-jobs
    content: Setup RabbitMQ and Kafka integration for background processing
    status: completed
    dependencies:
      - infrastructure
  - id: frontend-scaffold
    content: Create Next.js 15 app with Shadcn UI, Apollo Client, Socket.io
    status: completed
    dependencies:
      - monorepo-setup
  - id: frontend-auth
    content: Implement NextAuth.js with Keycloak, protected routes
    status: completed
    dependencies:
      - frontend-scaffold
      - auth-module
  - id: frontend-pages
    content: "Create all frontend pages: landing, dashboard, courses, social, events, jobs, admin"
    status: completed
    dependencies:
      - frontend-auth
      - api-layers
  - id: seeders
    content: Create comprehensive seeders for all modules with realistic test data
    status: completed
    dependencies:
      - lms-module
      - social-module
      - events-module
      - jobs-module
  - id: testing
    content: Setup testing infrastructure (Jest, Testing Library, Playwright) with sample tests
    status: completed
    dependencies:
      - frontend-pages
  - id: documentation
    content: Write comprehensive README, setup instructions, architecture docs, API documentation
    status: completed
    dependencies:
      - testing
---

# Complete LMS Platform - Full Implementation Plan

## Overview

We'll build a **production-ready monorepo** with:

- **Backend**: NestJS with Drizzle ORM, PostgreSQL, Redis, Kafka, RabbitMQ, Keycloak, multiple API layers
- **Frontend**: Next.js 15 with Shadcn UI, Apollo Client, Socket.io
- **Infrastructure**: Docker Compose with all services
- **All Modules**: Complete implementation of every module from the PRD

## Architecture

```mermaid
graph TB
    subgraph frontend [Frontend Layer]
        NextJS[Next.js 15 App]
        UI[Shadcn UI Components]
        Apollo[Apollo Client]
        SocketClient[Socket.io Client]
    end
    
    subgraph api [API Gateway]
        REST[REST Controllers]
        GraphQL[GraphQL Resolvers]
        gRPC[gRPC Services]
        WebSocket[WebSocket Gateways]
    end
    
    subgraph services [Service Layer]
        Auth[Auth Module]
        LMS[LMS Module]
        Social[Social Module]
        Events[Events Module]
        Jobs[Jobs Module]
        Chat[Chat Module]
        More[8+ More Modules]
    end
    
    subgraph infra [Infrastructure]
        Postgres[(PostgreSQL)]
        Redis[(Redis)]
        Kafka[Kafka]
        RabbitMQ[RabbitMQ]
        Keycloak[Keycloak]
        MinIO[MinIO S3]
    end
    
    NextJS --> REST
    NextJS --> GraphQL
    NextJS --> WebSocket
    Apollo --> GraphQL
    SocketClient --> WebSocket
    
    REST --> services
    GraphQL --> services
    gRPC --> services
    WebSocket --> services
    
    Auth --> Keycloak
    services --> Postgres
    services --> Redis
    services --> Kafka
    services --> RabbitMQ
    services --> MinIO
```

## Phase 1: Foundation & Infrastructure (Priority: CRITICAL)

### 1.1 Monorepo Setup with Turborepo

**Structure**:

```
/
├── apps/
│   ├── backend/          # NestJS backend
│   └── web/              # Next.js frontend
├── packages/
│   ├── database/         # Drizzle schemas & migrations
│   ├── shared-types/     # Shared TypeScript types
│   ├── ui/               # Shadcn UI components
│   └── config/           # Shared configs
├── docker/               # Docker Compose files
├── turbo.json
└── package.json
```

**Key Actions**:

1. Initialize Turborepo with `npx create-turbo@latest`
2. Configure workspaces in root `package.json`
3. Setup Turborepo pipelines in `turbo.json` for build, dev, lint, test
4. Install all dependencies with latest versions

**Dependencies**:

- Latest Turborepo, pnpm/npm workspaces
- TypeScript 5.x configuration
- ESLint, Prettier shared configs

### 1.2 Infrastructure Setup (Docker Compose)

**File**: [`docker/docker-compose.yml`](docker/docker-compose.yml)

**Services**:

1. **PostgreSQL 16**: Main database with pgvector extension
2. **Redis 7**: Caching and sessions
3. **Kafka + Zookeeper**: Event streaming
4. **RabbitMQ 3**: Job queues with management UI
5. **MinIO**: S3-compatible object storage
6. **Keycloak 23**: OIDC authentication provider

**Configuration**:

- Environment variables in `.env` files
- Volume mounts for data persistence
- Network configuration for service communication
- Health checks for all services

**Health Check Script**:

Create `docker/health-check.sh` to verify all services are running

### 1.3 Backend Scaffold (NestJS)

**Location**: `apps/backend/`

**Initial Setup**:

```bash
nest new backend
cd backend
nest generate module common
nest generate module config
nest generate module database
```

**Core Structure**:

```
apps/backend/
├── src/
│   ├── main.ts                    # Bootstrap with Swagger, GraphQL, gRPC
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/            # @CurrentUser, @Public, @Roles
│   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/          # LoggingInterceptor, AuditInterceptor
│   │   ├── filters/               # HttpExceptionFilter
│   │   ├── pipes/                 # ValidationPipe
│   │   └── middleware/            # RequestLogger, RateLimiter
│   ├── config/                    # Configuration modules
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── kafka.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── keycloak.config.ts
│   ├── database/
│   │   ├── drizzle.module.ts
│   │   ├── drizzle.service.ts
│   │   └── migrations/
│   └── modules/                   # All feature modules
├── test/
└── nest-cli.json
```

**Install Core Dependencies**:

```bash
npm i @nestjs/common @nestjs/core @nestjs/platform-express
npm i @nestjs/config @nestjs/swagger @nestjs/graphql @nestjs/apollo
npm i @nestjs/microservices @grpc/grpc-js @grpc/proto-loader
npm i @nestjs/websockets @nestjs/platform-socket.io
npm i drizzle-orm postgres ioredis kafkajs amqplib
npm i class-validator class-transformer zod
npm i keycloak-connect nestjs-keycloak-connect
npm i @nestjs/passport passport passport-jwt
```

### 1.4 Database Schema (Drizzle ORM)

**Location**: `packages/database/src/schema/`

**Modular Schema Files** (per module):

1. [`lookups.schema.ts`](packages/database/src/schema/lookups.schema.ts) - LookupTypes, Lookups
2. [`users.schema.ts`](packages/database/src/schema/users.schema.ts) - Users
3. [`subscriptions.schema.ts`](packages/database/src/schema/subscriptions.schema.ts) - Plans, PlanFeatures, Subscriptions, PaymentHistory
4. [`lms.schema.ts`](packages/database/src/schema/lms.schema.ts) - Courses, Sections, Lessons, Enrollments, Assignments, Quizzes, QuestionBank, QuizAttempts, Progress, Resources, Reviews, Certificates
5. [`comments.schema.ts`](packages/database/src/schema/comments.schema.ts) - Comments, CommentReactions
6. [`notes.schema.ts`](packages/database/src/schema/notes.schema.ts) - Notes
7. [`social.schema.ts`](packages/database/src/schema/social.schema.ts) - Posts, PostReactions, Groups, GroupMembers, Pages, PageMembers, PageLikes, PageFollows, Friends
8. [`chat.schema.ts`](packages/database/src/schema/chat.schema.ts) - ChatRooms, ChatParticipants, ChatMessages, MessageReads
9. [`events.schema.ts`](packages/database/src/schema/events.schema.ts) - Events, EventRegistrations, EventCategories
10. [`jobs.schema.ts`](packages/database/src/schema/jobs.schema.ts) - Jobs, JobApplications
11. [`tickets.schema.ts`](packages/database/src/schema/tickets.schema.ts) - Tickets, TicketReplies, Reports
12. [`media.schema.ts`](packages/database/src/schema/media.schema.ts) - MediaLibrary
13. [`favorites.schema.ts`](packages/database/src/schema/favorites.schema.ts) - Favorites
14. [`shares.schema.ts`](packages/database/src/schema/shares.schema.ts) - Shares
15. [`notifications.schema.ts`](packages/database/src/schema/notifications.schema.ts) - Notifications
16. [`audit.schema.ts`](packages/database/src/schema/audit.schema.ts) - AuditLogs
17. [`cms.schema.ts`](packages/database/src/schema/cms.schema.ts) - CMSPages
18. [`index.ts`](packages/database/src/schema/index.ts) - Export all schemas

**Schema Standards**:

- BIGINT for IDs
- UUID with `gen_random_uuid()`
- Timestamps with timezone
- Soft deletes (`isDeleted`, `deletedAt`)
- JSONB for metadata, SEO, translations
- Proper indexes and foreign keys

**Drizzle Configuration**:

```typescript
// drizzle.config.ts
export default {
  schema: './packages/database/src/schema/*',
  out: './packages/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL
  }
}
```

**Migration Commands**:

```bash
npm run db:generate   # Generate migrations
npm run db:push       # Push to database
npm run db:studio     # Open Drizzle Studio
```

## Phase 2: Authentication & Authorization (Priority: CRITICAL)

### 2.1 Keycloak Setup

**Docker Service**: Already configured in `docker-compose.yml`

**Keycloak Configuration**:

1. Create realm: `leap-lms`
2. Create client: `leap-lms-backend` (confidential)
3. Configure OIDC settings
4. Setup roles: Admin, Instructor, User, Recruiter
5. Create test users for each role

### 2.2 Authentication Module

**Generate Module**:

```bash
nest g module modules/auth
nest g service modules/auth
nest g controller modules/auth
```

**Files to Create**:

- [`apps/backend/src/modules/auth/auth.module.ts`](apps/backend/src/modules/auth/auth.module.ts)
- [`apps/backend/src/modules/auth/strategies/keycloak.strategy.ts`](apps/backend/src/modules/auth/strategies/keycloak.strategy.ts)
- [`apps/backend/src/modules/auth/strategies/jwt.strategy.ts`](apps/backend/src/modules/auth/strategies/jwt.strategy.ts)
- [`apps/backend/src/common/guards/jwt-auth.guard.ts`](apps/backend/src/common/guards/jwt-auth.guard.ts)
- [`apps/backend/src/common/guards/roles.guard.ts`](apps/backend/src/common/guards/roles.guard.ts)
- [`apps/backend/src/common/decorators/public.decorator.ts`](apps/backend/src/common/decorators/public.decorator.ts)
- [`apps/backend/src/common/decorators/roles.decorator.ts`](apps/backend/src/common/decorators/roles.decorator.ts)
- [`apps/backend/src/common/decorators/current-user.decorator.ts`](apps/backend/src/common/decorators/current-user.decorator.ts)

**Features**:

- OIDC integration with Keycloak
- JWT token validation
- Token refresh flow
- Role mapping and sync with local DB
- Session management with Redis

## Phase 3: Core Modules (Priority: HIGH)

### 3.1 Lookups Module (Foundation)

**Generate**:

```bash
nest g resource modules/lookups --no-spec
```

**Endpoints**:

- REST: CRUD operations
- GraphQL: Queries and mutations
- gRPC: Lookup service

**Key Features**:

- Hierarchical lookup types
- Multi-language support (AR/EN)
- Metadata handling
- Caching with Redis

**Seeder Data**:

50+ lookup types with 200+ lookup values covering all enums from PRD

### 3.2 Users Module

**Generate**:

```bash
nest g resource modules/users --no-spec
```

**API Layers**:

- REST: User CRUD, profile management
- GraphQL: User queries with relations
- gRPC: User service for internal calls
- WebSocket: Online status updates

**Features**:

- User profiles with avatar upload
- Role management
- Online/offline status
- Last seen tracking
- Multi-language preferences
- Timezone support

### 3.3 Subscriptions Module

**Generate**:

```bash
nest g resource modules/subscriptions --no-spec
nest g resource modules/plans --no-spec
```

**Entities**:

- Plans (pricing tiers)
- PlanFeatures (feature flags per plan)
- Subscriptions (user subscriptions)
- PaymentHistory (transaction records)

**Features**:

- Plan comparison
- Subscription lifecycle (trial, active, expired, cancelled)
- Auto-renewal handling
- Billing cycle management
- Access control based on plan

### 3.4 Payments Module

**Generate**:

```bash
nest g resource modules/payments --no-spec
```

**Features**:

- PayPal SDK integration (sandbox mode)
- Mock payment processing
- Invoice generation (PDF)
- Unique invoice numbers
- Payment webhooks
- Queue integration for invoice generation (RabbitMQ)

**Invoice Generation**:

- Use PDFKit or Puppeteer
- Company branding
- Email invoice to user
- Store in MediaLibrary

### 3.5 Notifications Module

**Generate**:

```bash
nest g resource modules/notifications --no-spec
```

**Channels**:

1. **FCM (Firebase Cloud Messaging)**: Push notifications
2. **Email**: SMTP with templates
3. **Database**: In-app notifications

**Features**:

- Multi-channel delivery
- Notification preferences
- Read/unread status
- Real-time WebSocket updates
- Template system
- Queue processing (RabbitMQ)

**Notification Types**:

- Enrollment confirmations
- Comment replies
- Friend requests
- Job applications
- Event reminders
- Certificate availability
- Subscription expiry

## Phase 4: LMS Module (Priority: HIGH)

### 4.1 LMS Core Entities

**Generate All Submodules**:

```bash
nest g resource modules/lms/courses --no-spec
nest g resource modules/lms/sections --no-spec
nest g resource modules/lms/lessons --no-spec
nest g resource modules/lms/resources --no-spec
nest g resource modules/lms/enrollments --no-spec
nest g resource modules/lms/assignments --no-spec
nest g resource modules/lms/quizzes --no-spec
nest g resource modules/lms/progress --no-spec
nest g resource modules/lms/reviews --no-spec
nest g resource modules/lms/certificates --no-spec
```

**Course Structure**:

```
Course
├── Sections (Modules/Chapters)
│   ├── Lessons (Videos, Text, etc.)
│   │   └── Resources (PDFs, files)
│   ├── Assignments
│   └── Quizzes
└── Course-level Resources
```

**API Implementation**:

- REST: Full CRUD operations
- GraphQL: Complex queries with nested relations
- gRPC: Course enrollment service
- WebSocket: Real-time progress updates

### 4.2 LMS Features

**Courses**:

- Multi-language content (AR/EN)
- SEO metadata (JSON)
- Categories (hierarchical)
- Instructor assignment
- Enrollment types (purchase/subscription)
- Pricing and access control
- Featured courses
- View/favorite/share tracking

**Enrollments**:

- Purchase or subscription-based
- Progress tracking
- Completion status
- Expiration handling
- Access validation middleware

**Progress Tracking**:

- Lesson completion
- Time spent per lesson
- Quiz scores
- Assignment grades
- Overall course progress percentage

**Assignments**:

- Instructions and requirements
- File submissions
- Grading system
- Feedback
- Due dates and late submissions

**Quizzes**:

- Question bank system
- Multiple question types
- Time limits and attempts
- Auto-grading
- Show/hide correct answers
- Passing score configuration

**Certificates**:

- Auto-generation on course completion
- Unique certificate numbers
- PDF generation
- Download tracking
- Verification system

## Phase 5: Social & Communication (Priority: MEDIUM)

### 5.1 Comments Module (Universal)

**Generate**:

```bash
nest g resource modules/comments --no-spec
```

**Features**:

- Polymorphic relations (commentable_type/commentable_id)
- Nested/threaded comments
- Reactions (Like, Love, etc.)
- Comment on: Courses, Lessons, Posts, Events, Jobs, etc.
- Real-time updates via WebSocket

### 5.2 Notes Module

**Generate**:

```bash
nest g resource modules/notes --no-spec
```

**Features**:

- Private/Public/Instructors-only visibility
- Color coding
- Pin/archive functionality
- Like public notes
- Polymorphic relations (noteable_type/noteable_id)

### 5.3 Social Module

**Generate**:

```bash
nest g resource modules/social/posts --no-spec
nest g resource modules/social/groups --no-spec
nest g resource modules/social/pages --no-spec
nest g resource modules/social/friends --no-spec
```

**Posts**:

- Text, image, video, link types
- Visibility settings
- Post to timeline, groups, pages
- Reactions and comments
- Share functionality

**Groups**:

- Public/Private/Secret
- Member roles (Owner, Moderator, Member)
- Group posts
- Member management
- Group chat

**Pages**:

- Professional/business pages
- Page roles (Owner, Admin, Editor, Viewer)
- Likes and followers
- Page posts
- Analytics

**Friends**:

- Friend requests (send, accept, decline, block)
- Friends list
- Privacy settings
- Private messaging

### 5.4 Chat Module

**Generate**:

```bash
nest g gateway modules/chat/chat.gateway --no-spec
nest g resource modules/chat/rooms --no-spec
nest g resource modules/chat/messages --no-spec
```

**Features**:

- Public chat rooms (courses, groups, events)
- Private one-on-one chat
- Real-time messaging (Socket.io)
- File sharing
- Message editing/deletion
- Read receipts
- Typing indicators
- Online/offline status
- Message search

**WebSocket Events**:

- `message:send`
- `message:edit`
- `message:delete`
- `typing:start`
- `typing:stop`
- `user:online`
- `user:offline`

## Phase 6: Extended Features (Priority: MEDIUM)

### 6.1 Events Module

**Generate**:

```bash
nest g resource modules/events --no-spec
nest g resource modules/events/categories --no-spec
nest g resource modules/events/registrations --no-spec
```

**Features**:

- Online/In-person/Hybrid events
- Event categories
- Registration management
- Attendance status (Going, Interested, Maybe, Not Going)
- Capacity limits
- Event chat rooms
- Comments, favorites, sharing
- SEO support

### 6.2 Jobs Module

**Generate**:

```bash
nest g resource modules/jobs --no-spec
nest g resource modules/jobs/applications --no-spec
```

**Features**:

- Job posting with multi-language support
- Job types and experience levels
- Application management
- Resume upload
- Application status tracking
- Company association (Pages)
- Application count tracking
- Comments, favorites, sharing
- SEO support

### 6.3 Favorites Module (Universal)

**Generate**:

```bash
nest g resource modules/favorites --no-spec
```

**Features**:

- Polymorphic favoriting (courses, posts, events, pages, groups, jobs)
- Personal collections
- Favorite count tracking
- Quick access

### 6.4 Sharing Module

**Generate**:

```bash
nest g resource modules/shares --no-spec
```

**Features**:

- Internal platform sharing
- External sharing (social media, email, link)
- Share count tracking
- Share to groups/timeline
- Referral tracking

### 6.5 Media Module

**Generate**:

```bash
nest g resource modules/media --no-spec
```

**Features**:

- Unified storage system
- Multiple providers (Local, S3, MinIO, Cloudflare R2, Backblaze)
- Temporary uploads (24h expiration)
- Auto-cleanup job
- Polymorphic relations
- File metadata (EXIF, dimensions)
- Download tracking
- Access control

**Storage Integration**:

- Configure providers via Lookups
- Presigned URLs for uploads/downloads
- Image processing (resize, thumbnails)
- CDN integration

### 6.6 Ticketing Module

**Generate**:

```bash
nest g resource modules/tickets --no-spec
nest g resource modules/reports --no-spec
```

**Tickets (Contact Us)**:

- Categories and priorities
- Assignment system
- Status tracking
- Ticket replies
- Email notifications

**Reports**:

- Report any entity (posts, users, courses, comments, jobs)
- Report types and status
- Moderator dashboard
- Admin actions

### 6.7 CMS Module

**Generate**:

```bash
nest g resource modules/cms --no-spec
```

**Features**:

- Landing page management
- Multi-language content (AR/EN in JSON)
- Dynamic page builder
- SEO metadata per page
- Page components (hero, features, testimonials, FAQ)
- Published/draft status

### 6.8 Audit Module

**Generate**:

```bash
nest g resource modules/audit --no-spec
```

**Features**:

- Comprehensive activity logging
- Track all CRUD operations
- Before/after state (JSON)
- User identification
- IP address and user agent
- Searchable audit trail
- Audit interceptor for automatic logging

**Implementation**:

- Create `AuditInterceptor` that logs all controller actions
- Store old and new values
- Background processing via Kafka

## Phase 7: API Layers (Priority: HIGH)

### 7.1 REST API

**Already implemented** via `nest g resource` with `--no-spec` flag

**Enhancements**:

- Swagger documentation with decorators
- API versioning (`/api/v1/`)
- Pagination, filtering, sorting
- Response transformation
- Error handling

**Swagger Setup**:

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('LEAP LMS API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### 7.2 GraphQL API

**Setup**:

```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

**Configuration**:

- Code-first approach
- Auto-generate schema
- GraphQL Playground at `/graphql`
- DataLoader for N+1 prevention
- Subscriptions for real-time data

**File**: [`apps/backend/src/graphql/schema.gql`](apps/backend/src/graphql/schema.gql) (auto-generated)

**Resolvers**:

- Create resolvers for each module
- Field resolvers for relations
- Query complexity limits
- Authentication guards

### 7.3 gRPC API

**Setup**:

```bash
npm i @nestjs/microservices @grpc/grpc-js @grpc/proto-loader
```

**Proto Files**:

- [`apps/backend/src/grpc/proto/users.proto`](apps/backend/src/grpc/proto/users.proto)
- [`apps/backend/src/grpc/proto/courses.proto`](apps/backend/src/grpc/proto/courses.proto)
- Other service protos

**Implementation**:

- gRPC services for internal communication
- Health checks
- Metadata handling

### 7.4 WebSocket API

**Setup**:

```bash
npm i @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Gateways**:

- Chat gateway (already created)
- Notifications gateway
- Progress updates gateway
- Online status gateway

**Namespaces**:

- `/chat` - Chat messages
- `/notifications` - Real-time notifications
- `/progress` - Course progress updates

**Authentication**:

- JWT in handshake
- Room-based messaging
- Presence tracking

## Phase 8: Background Jobs & Events (Priority: HIGH)

### 8.1 RabbitMQ Integration

**Use Cases**:

- Email sending
- Invoice generation
- Certificate generation
- Media processing
- Temporary file cleanup

**Queues**:

- `email-queue`
- `invoice-queue`
- `certificate-queue`
- `media-processing-queue`
- `cleanup-queue`

**Implementation**:

```typescript
// Configure RabbitMQ in config module
// Create consumers for each queue
// Use @nestjs/microservices
```

### 8.2 Kafka Integration

**Use Cases**:

- Event streaming (enrollment.created, course.completed)
- Audit logging
- Analytics events
- User activity tracking

**Topics**:

- `lms-events`
- `social-events`
- `audit-events`
- `user-events`

**Implementation**:

- Kafka producer service
- Kafka consumer service
- Event handlers

## Phase 9: Frontend (Next.js 15) (Priority: HIGH)

### 9.1 Frontend Scaffold

**Create App**:

```bash
npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir
cd apps/web
```

**Install Dependencies**:

```bash
npm i @apollo/client graphql socket.io-client
npm i @tanstack/react-query zustand
npm i react-hook-form zod @hookform/resolvers
npm i next-auth
npm i @radix-ui/react-* (all Radix UI components)
npm i lucide-react
npm i next-intl (for i18n)
```

**Setup Shadcn UI**:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input form card dialog
# Add all needed components
```

**Structure**:

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── courses/
│   │   ├── subscriptions/
│   │   ├── profile/
│   │   ├── social/
│   │   ├── chat/
│   │   ├── events/
│   │   └── jobs/
│   ├── (public)/
│   │   ├── page.tsx (landing)
│   │   ├── about/
│   │   └── pricing/
│   ├── (admin)/
│   │   └── dashboard/
│   ├── (instructor)/
│   │   └── courses/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/ (Shadcn components)
│   ├── forms/
│   ├── layouts/
│   └── features/
│       ├── courses/
│       ├── social/
│       └── ...
├── lib/
│   ├── api/ (REST clients)
│   ├── apollo/ (GraphQL client)
│   ├── socket/ (WebSocket client)
│   ├── hooks/
│   └── utils/
├── stores/ (Zustand)
└── graphql/
    ├── queries/
    ├── mutations/
    └── generated/
```

### 9.2 Authentication (NextAuth.js)

**Setup**:

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    })
  ],
  // Configure session, callbacks, etc.
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Protected Routes**:

- Create middleware for auth
- Role-based route protection
- Redirect logic

### 9.3 Key Pages & Components

**Landing Page** (`app/(public)/page.tsx`):

- Hero section
- Features showcase
- Course highlights
- Subscription plans
- Testimonials
- FAQ
- CTA sections

**Dashboard** (`app/(dashboard)/page.tsx`):

- User overview
- Recent courses
- Notifications
- Quick actions
- Progress summary

**Courses**:

- Browse/search courses (`/courses`)
- Course details (`/courses/[slug]`)
- Learning interface (`/courses/[slug]/learn`)
- My courses (`/dashboard/courses`)
- Enrollment flow
- Progress tracking

**Subscriptions** (`/dashboard/subscriptions`):

- Plan comparison
- Current subscription
- Billing history
- Upgrade/downgrade
- Invoice downloads

**Social** (`/social`):

- Timeline/feed
- Groups (`/social/groups`)
- Pages (`/social/pages`)
- Friends (`/social/friends`)
- Create post
- Comments and reactions

**Chat** (`/chat`):

- Chat list
- Chat interface
- Real-time messaging
- File sharing

**Events** (`/events`):

- Browse events
- Event details (`/events/[slug]`)
- Registration
- My events
- Attendance status

**Jobs** (`/jobs`):

- Browse jobs
- Job details (`/jobs/[slug]`)
- Apply
- My applications
- Application tracking

**Profile** (`/profile`):

- Edit profile
- Avatar upload
- Settings
- Preferences
- Activity log

**Admin Panel** (`/admin`):

- User management
- Content moderation
- Reports review
- System settings
- Analytics

**Instructor Dashboard** (`/instructor`):

- My courses
- Create course
- Student management
- Grading
- Analytics

### 9.4 Apollo Client Setup

**Configuration**:

```typescript
// lib/apollo/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    // Include auth token
  }),
  cache: new InMemoryCache(),
});
```

**GraphQL Codegen**:

```bash
npm i -D @graphql-codegen/cli @graphql-codegen/typescript
# Configure codegen.yml
# Generate types from schema
```

### 9.5 Socket.io Client Setup

**Configuration**:

```typescript
// lib/socket/client.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  auth: {
    token: 'JWT_TOKEN'
  }
});

// Connect to namespaces
export const chatSocket = io(`${process.env.NEXT_PUBLIC_WS_URL}/chat`);
export const notificationsSocket = io(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`);
```

**Hooks**:

```typescript
// lib/hooks/useSocket.ts
export function useSocket() {
  // Socket connection logic
  // Event listeners
  // Cleanup
}
```

### 9.6 UI Components (Shadcn)

**Install All Needed Components**:

```bash
npx shadcn-ui@latest add button input form card dialog
npx shadcn-ui@latest add dropdown-menu select textarea
npx shadcn-ui@latest add table badge avatar
npx shadcn-ui@latest add tabs accordion alert
npx shadcn-ui@latest add toast progress separator
npx shadcn-ui@latest add sheet sidebar navigation-menu
# etc...
```

**Custom Components**:

- Course card
- Post card
- Event card
- Job card
- Chat message
- Comment thread
- Notification item
- Progress ring
- Certificate preview
- Invoice preview

### 9.7 State Management

**Zustand Stores**:

- `useAuthStore` - User, token, roles
- `useChatStore` - Chat rooms, messages
- `useNotificationStore` - Notifications
- `useUIStore` - Theme, sidebar, modals

**React Query**:

- Data fetching and caching
- Mutations
- Optimistic updates
- Infinite scroll

## Phase 10: Seeders & Test Data (Priority: MEDIUM)

### 10.1 Seeder Structure

**Location**: `apps/backend/src/database/seeders/`

**Files**:

1. [`01-lookup-types.seeder.ts`](apps/backend/src/database/seeders/01-lookup-types.seeder.ts)
2. [`02-lookups.seeder.ts`](apps/backend/src/database/seeders/02-lookups.seeder.ts)
3. [`03-users.seeder.ts`](apps/backend/src/database/seeders/03-users.seeder.ts)
4. [`04-plans.seeder.ts`](apps/backend/src/database/seeders/04-plans.seeder.ts)
5. [`05-course-categories.seeder.ts`](apps/backend/src/database/seeders/05-course-categories.seeder.ts)
6. [`06-courses.seeder.ts`](apps/backend/src/database/seeders/06-courses.seeder.ts)
7. [`07-enrollments.seeder.ts`](apps/backend/src/database/seeders/07-enrollments.seeder.ts)
8. [`08-social.seeder.ts`](apps/backend/src/database/seeders/08-social.seeder.ts)
9. [`09-events.seeder.ts`](apps/backend/src/database/seeders/09-events.seeder.ts)
10. [`10-jobs.seeder.ts`](apps/backend/src/database/seeders/10-jobs.seeder.ts)
11. [`index.ts`](apps/backend/src/database/seeders/index.ts) - Master seeder

**Seeder Command**:

```bash
nest g module database/seeders
# Create seeder service
npm run seed
npm run seed:reset
```

### 10.2 Test Data

**Lookups**:

- 50+ lookup types
- 200+ lookup values
- All enums from PRD

**Users**:

- 1 Admin
- 5 Instructors
- 2 Recruiters
- 50 Students
- All with profiles, avatars

**Plans**:

- Free tier
- Basic ($9.99/month)
- Premium ($29.99/month)
- Enterprise ($99.99/month)

**Courses**:

- 20 courses across categories
- 5 sections per course
- 10 lessons per section
- Mix of video, text, quiz, assignment content
- Sample resources (PDFs, files)

**Enrollments**:

- Random student enrollments
- Mix of purchases and subscriptions
- Various progress levels

**Social**:

- 100 posts
- 10 groups with members
- 10 pages with followers
- Friend connections

**Events**:

- 15 events (past, ongoing, upcoming)
- Registrations and attendance

**Jobs**:

- 30 job postings
- 100 applications
- Various statuses

## Phase 11: Testing & Quality Assurance (Priority: LOW)

### 11.1 Backend Testing

**Unit Tests**:

- Service layer tests with Jest
- Repository mocks
- Business logic validation

**Integration Tests**:

- Controller tests with Supertest
- Database integration
- End-to-end flows

**E2E Tests**:

- Full API flow tests
- Authentication flows
- CRUD operations

**Coverage Target**: 80%+

### 11.2 Frontend Testing

**Component Tests**:

- React Testing Library
- User interaction tests
- Accessibility tests (jest-axe)

**E2E Tests**:

- Playwright
- Critical user journeys
- Authentication flows
- Course enrollment
- Payment flows

## Phase 12: Documentation (Priority: LOW)

### 12.1 Code Documentation

- JSDoc comments
- Type definitions
- API documentation (Swagger)
- GraphQL schema documentation

### 12.2 User Documentation

**Files**:

- [`README.md`](README.md) - Project overview, setup instructions
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Development guidelines
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture
- [`API.md`](API.md) - API documentation
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment instructions

**Content**:

- Installation guide
- Development workflow
- Environment setup
- Docker commands
- Database migrations
- Seeder usage
- Testing instructions
- API examples
- GraphQL queries
- WebSocket events

## Environment Variables

**Backend** (`.env`):

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leap_lms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=leap-lms
KEYCLOAK_CLIENT_ID=leap-lms-backend
KEYCLOAK_CLIENT_SECRET=your-secret

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Kafka
KAFKA_BROKERS=localhost:9092

# Storage
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# PayPal
PAYPAL_CLIENT_ID=sandbox-client-id
PAYPAL_SECRET=sandbox-secret
PAYPAL_MODE=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# FCM
FCM_PROJECT_ID=your-firebase-project
FCM_PRIVATE_KEY=your-service-account-key
```

**Frontend** (`.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3000

NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret

KEYCLOAK_CLIENT_ID=leap-lms-frontend
KEYCLOAK_CLIENT_SECRET=your-secret
KEYCLOAK_ISSUER=http://localhost:8080/realms/leap-lms
```

## Development Commands

```bash
# Root
npm install                    # Install all dependencies
npm run dev                    # Start all apps in dev mode
npm run build                  # Build all apps
npm run lint                   # Lint all code
npm run format                 # Format code

# Backend
cd apps/backend
npm run start:dev              # Dev mode with watch
npm run start:debug            # Debug mode
npm run build                  # Build
npm run test                   # Run tests
npm run test:e2e               # E2E tests

# Frontend
cd apps/web
npm run dev                    # Dev mode
npm run build                  # Build
npm run start                  # Production mode
npm run lint                   # Lint

# Database
npm run db:generate            # Generate migrations
npm run db:push                # Push schema
npm run db:migrate             # Run migrations
npm run db:studio              # Open Drizzle Studio
npm run seed                   # Run seeders
npm run seed:reset             # Reset and reseed

# Docker
docker-compose -f docker/docker-compose.yml up -d
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml logs -f
```

## Implementation Order

1. **Foundation** (Monorepo, Infrastructure, Backend Scaffold, Database Schemas)
2. **Authentication** (Keycloak, Auth Module, Guards, Decorators)
3. **Core Modules** (Lookups, Users, Subscriptions, Payments, Notifications)
4. **LMS Module** (Full implementation with all submodules)
5. **Social & Communication** (Comments, Notes, Social, Chat)
6. **Extended Features** (Events, Jobs, Favorites, Sharing, Media, Ticketing, CMS, Audit)
7. **API Layers** (REST, GraphQL, gRPC, WebSocket)
8. **Background Jobs** (RabbitMQ, Kafka)
9. **Frontend** (Scaffold, Auth, Pages, Components)
10. **Seeders** (All test data)
11. **Testing** (Unit, Integration, E2E)
12. **Documentation** (README, guides, API docs)

## Success Criteria

- ✅ Monorepo with Turborepo fully configured
- ✅ All infrastructure services running (Docker Compose)
- ✅ Database schemas for all 40+ tables created
- ✅ All 15+ modules implemented with full CRUD
- ✅ All API layers functional (REST, GraphQL, gRPC, WebSocket)
- ✅ Keycloak authentication working
- ✅ Frontend with all major pages and features
- ✅ Real-time chat and notifications working
- ✅ Payment flow (mocked) functional
- ✅ Seeders populate realistic test data
- ✅ Documentation complete

## Timeline Estimate

- **Phase 1-2** (Foundation + Auth): 10-15 hours
- **Phase 3** (Core Modules): 8-10 hours
- **Phase 4** (LMS): 12-15 hours
- **Phase 5** (Social): 8-10 hours
- **Phase 6** (Extended Features): 10-12 hours
- **Phase 7-8** (APIs + Jobs): 6-8 hours
- **Phase 9** (Frontend): 20-25 hours
- **Phase 10** (Seeders): 4-6 hours
- **Phase 11-12** (Testing + Docs): 6-8 hours

**Total**: 85-110 hours (will be executed incrementally)