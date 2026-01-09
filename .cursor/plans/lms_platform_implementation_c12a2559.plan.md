---
name: LMS Platform Implementation
overview: Transform the current project into a comprehensive monorepo-based LMS platform with NestJS backend (REST/GraphQL/gRPC/WebSocket APIs) and Next.js 16 frontend, implementing Phase 1 core modules (Authentication, Users, Lookups, Subscriptions, LMS) with full infrastructure setup including Drizzle ORM, PostgreSQL, Redis, Kafka, RabbitMQ, and Keycloak integration.
todos:
  - id: monorepo-setup
    content: Setup Turborepo monorepo structure with apps/ and packages/ directories
    status: in_progress
  - id: backend-scaffold
    content: "Create NestJS backend app with CLI: modules, guards, interceptors, filters"
    status: pending
  - id: database-schemas
    content: Create all Drizzle schemas for Phase 1 modules (lookups, users, subscriptions, lms)
    status: pending
  - id: infrastructure
    content: Setup Docker Compose with PostgreSQL, Redis, RabbitMQ, Kafka, Zookeeper, MinIO
    status: pending
  - id: auth-module
    content: Implement authentication with Keycloak OIDC, JWT strategies, guards, decorators
    status: pending
  - id: lookups-module
    content: Implement Lookups module with REST, GraphQL, gRPC endpoints
    status: pending
  - id: users-module
    content: Implement Users module with CRUD, roles, profiles across all API types
    status: pending
  - id: subscriptions-module
    content: Implement Subscriptions module (plans, features, subscriptions, payment history)
    status: pending
  - id: payments-module
    content: Implement Payments module with PayPal integration and mock payment processing and invoice generation
    status: pending
  - id: lms-module
    content: Implement LMS module (courses, sections, lessons, enrollments, assignments, quizzes, progress, certificates)
    status: pending
  - id: notifications-module
    content: Implement Notifications module with FCM, Email, and Database channels
    status: pending
  - id: media-module
    content: Implement Media module with S3/MinIO integration, temporary uploads, polymorphic relations
    status: pending
  - id: audit-module
    content: Implement Audit module for comprehensive activity logging
    status: pending
  - id: api-layers
    content: "Setup all API layers: REST with Swagger, GraphQL with Playground, gRPC with proto files, WebSocket with Socket.io"
    status: pending
  - id: frontend-scaffold
    content: Create Next.js 16 app with App Router, Shadcn UI, Tailwind CSS, Apollo Client, Socket.io client
    status: pending
  - id: frontend-auth
    content: Implement NextAuth.js with Keycloak provider, protected routes, role-based access
    status: pending
  - id: frontend-pages
    content: "Create frontend pages: landing, login, dashboard, courses, subscriptions, profile"
    status: pending
  - id: seeders
    content: Create comprehensive seeders for all Phase 1 modules with realistic test data
    status: pending
  - id: testing
    content: Setup testing infrastructure (Jest, Testing Library, Playwright) with sample tests
    status: pending
  - id: documentation
    content: Write comprehensive README with setup instructions, architecture docs, API documentation
    status: pending
---

# LMS Platform - Full Implementation Plan

## Architecture Overview

```mermaid
graph TB
    subgraph client [Client Layer]
        Web[Next.js 16 Frontend]
        Mobile[Future Mobile Apps]
    end
    
    subgraph gateway [API Gateway Layer]
        REST[REST API]
        GraphQL[GraphQL API]
        WS[WebSocket Server]
        gRPC[gRPC Services]
    end
    
    subgraph services [Service Layer - NestJS]
        Auth[Auth Service]
        LMS[LMS Service]
        Social[Social Service]
        Jobs[Jobs Service]
        Events[Events Service]
        Chat[Chat Service]
    end
    
    subgraph infrastructure [Infrastructure]
        DB[(PostgreSQL + Drizzle)]
        Cache[(Redis)]
        MQ1[RabbitMQ]
        MQ2[Kafka]
        KC[Keycloak]
        S3[Storage S3/MinIO]
    end
    
    Web --> REST
    Web --> GraphQL
    Web --> WS
    Mobile --> gRPC
    
    REST --> services
    GraphQL --> services
    WS --> services
    gRPC --> services
    
    services --> DB
    services --> Cache
    services --> MQ1
    services --> MQ2
    Auth --> KC
    services --> S3
```

## Phase 1: Foundation & Core Modules

### 1. Monorepo Setup with Turborepo

**Structure:**

```
leap-company/
├── apps/
│   ├── backend/          # NestJS backend
│   └── web/              # Next.js 16 frontend
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── ui/               # Shadcn UI components
│   ├── config/           # Shared configs (ESLint, TS, etc.)
│   └── database/         # Drizzle schemas & migrations
├── docker/               # Docker compose files
├── turbo.json
└── package.json
```

**Key Files:**

- [`turbo.json`](turbo.json): Pipeline configuration for build, dev, lint, test
- Root [`package.json`](package.json): Workspace definitions
- [`.env.example`](.env.example): Environment variable templates

### 2. Backend Infrastructure Setup

**Core Stack:**

- **Framework**: NestJS latest with TypeScript latest
- **ORM**: Drizzle ORM with PostgreSQL 18
- **Cache**: Redis latest with ioredis
- **Message Queue**: RabbitMQ (job queues) + Kafka (event streaming)
- **Auth**: Keycloak OIDC integration + JWT strategy
- **APIs**: REST (Express), GraphQL (Apollo), gRPC (proto3), WebSocket (Socket.io)
- **Validation**: class-validator, class-transformer, Zod
- **File Upload**: Multer with S3/MinIO support

**Backend Structure:**

```
apps/backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/               # Shared utilities
│   │   ├── decorators/       # Custom decorators
│   │   ├── guards/           # Auth guards, RBAC guards
│   │   ├── interceptors/     # Logging, transform, audit
│   │   ├── filters/          # Exception filters
│   │   ├── pipes/            # Validation pipes
│   │   └── middleware/       # Request middleware
│   ├── config/               # Configuration modules
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── kafka.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── keycloak.config.ts
│   ├── database/             # Drizzle setup
│   │   ├── drizzle.module.ts
│   │   └── drizzle.service.ts
│   ├── modules/
│   │   ├── auth/             # Authentication & authorization
│   │   ├── users/            # User management
│   │   ├── lookups/          # Lookup system
│   │   ├── subscriptions/    # Plans & subscriptions
│   │   ├── payments/         # Payment processing (PayPal mock)
│   │   ├── lms/              # LMS module (courses, lessons, etc.)
│   │   ├── notifications/    # FCM/Email/Database notifications
│   │   ├── media/            # File uploads & storage
│   │   ├── audit/            # Audit logging
│   │   └── ...               # Future modules
│   ├── graphql/              # GraphQL setup
│   │   ├── schema.gql
│   │   └── resolvers/
│   ├── grpc/                 # gRPC setup
│   │   ├── proto/
│   │   └── services/
│   └── websocket/            # WebSocket gateway
│       └── gateways/
├── test/
└── nest-cli.json
```

**Key Implementation Details:**

**API Layer Strategy:**

- **REST**: Standard CRUD operations, file uploads, traditional endpoints
- **GraphQL**: Complex queries with relations, real-time subscriptions
- **gRPC**: Internal service-to-service communication, high-performance operations
- **WebSocket**: Real-time chat, notifications, live updates

**Example Module Structure** (`apps/backend/src/modules/users/`):

```
users/
├── users.module.ts
├── users.controller.ts        # REST endpoints
├── users.service.ts           # Business logic
├── users.resolver.ts          # GraphQL resolver
├── users.grpc.service.ts      # gRPC service
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-query.dto.ts
├── entities/
│   └── user.entity.ts         # GraphQL entity
└── interfaces/
    └── user.interface.ts
```

### 3. Database Schema (Drizzle ORM)

**Schema Organization** (`packages/database/src/schema/`):

```
schema/
├── lookups.schema.ts          # lookup_types, lookups
├── users.schema.ts            # users
├── subscriptions.schema.ts    # plans, plan_features, subscriptions, payment_history
├── lms.schema.ts              # courses, sections, lessons, enrollments, etc.
├── comments.schema.ts         # comments, comment_reactions
├── notes.schema.ts            # notes
├── social.schema.ts           # posts, groups, pages, friends, etc.
├── chat.schema.ts             # chat_rooms, messages, participants
├── events.schema.ts           # events, registrations, categories
├── jobs.schema.ts             # jobs, applications
├── tickets.schema.ts          # tickets, reports
├── media.schema.ts            # media_library
├── favorites.schema.ts        # favorites
├── shares.schema.ts           # shares
├── notifications.schema.ts    # notifications
├── audit.schema.ts            # audit_logs
└── index.ts                   # Export all schemas
```

**Schema Standards:**

- All tables use `bigserial` for `id` (primary key)
- UUID field: `uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE`
- Timestamps: `createdAt`, `updatedAt`, `deletedAt` (timestamptz)
- Soft deletes: `isDeleted BOOLEAN DEFAULT FALSE`
- Foreign keys use Drizzle relations
- Indexes on: UUIDs, foreign keys, frequently queried fields
- JSONB fields for: metadata, SEO, translations

**Example Schema** ([`packages/database/src/schema/users.schema.ts`](packages/database/src/schema/users.schema.ts)):

```typescript
import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { lookups } from './lookups.schema';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('firstName', { length: 100 }),
  lastName: varchar('lastName', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  resumeUrl: varchar('resume_url', { length: 500 }),
  roleId: bigserial('role_id').references(() => lookups.id),
  statusId: bigserial('status_id').references(() => lookups.id),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('en'),
  timezone: varchar('timezone', { length: 50 }),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  isOnline: boolean('isOnline').default(false),
  isActive: boolean('isActive').default(true),
  isDeleted: boolean('isDeleted').default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true })
}, (table) => ({
  uuidIdx: index('users_uuid_idx').on(table.uuid),
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_id_idx').on(table.roleId),
}));
```

**Migrations:**

- Use Drizzle Kit for migrations: `drizzle-kit generate`, `drizzle-kit push`
- Store in `packages/database/migrations/`
- Run migrations on app startup or via CLI

### 4. Authentication Module

**Keycloak Integration:**

- OIDC provider configuration
- JWT token validation
- Role mapping (Admin, Instructor, User, Recruiter)
- Token refresh flow
- User sync between Keycloak and local DB

**Guards & Decorators:**

```typescript
// @Public() - Skip auth
// @Roles('admin', 'instructor') - Role-based access
// @CurrentUser() - Inject user from request
// @Permissions('courses:write') - Fine-grained permissions
```

**Files:**

- [`apps/backend/src/modules/auth/auth.module.ts`](apps/backend/src/modules/auth/auth.module.ts)
- [`apps/backend/src/modules/auth/strategies/keycloak.strategy.ts`](apps/backend/src/modules/auth/strategies/keycloak.strategy.ts)
- [`apps/backend/src/common/guards/jwt-auth.guard.ts`](apps/backend/src/common/guards/jwt-auth.guard.ts)
- [`apps/backend/src/common/guards/roles.guard.ts`](apps/backend/src/common/guards/roles.guard.ts)

### 5. Core Modules Implementation

**Priority Order:**

1. **Lookups Module** - Foundation for all other modules
2. **Users Module** - User management and profiles
3. **Subscriptions Module** - Plans, features, subscriptions, payment history
4. **Payments Module** - PayPal integration (mocked), invoice generation
5. **LMS Module** - Courses, sections, lessons, enrollments, progress tracking, assignments, quizzes, resources, reviews, certificates
6. **Notifications Module** - FCM, Email, Database notifications
7. **Media Module** - File uploads, storage providers (S3/MinIO), temporary uploads
8. **Audit Module** - Activity logging for all operations

**LMS Module Structure:**

```
lms/
├── lms.module.ts
├── courses/
│   ├── courses.controller.ts
│   ├── courses.service.ts
│   ├── courses.resolver.ts
│   ├── courses.grpc.service.ts
│   └── dto/
├── sections/
├── lessons/
├── enrollments/
├── assignments/
├── quizzes/
├── resources/
├── progress/
├── reviews/
└── certificates/
```

**Service Integration:**

- **Redis**: Caching for courses, user sessions, rate limiting
- **RabbitMQ**: Background jobs (email sending, certificate generation, invoice creation)
- **Kafka**: Event streaming (enrollment.created, course.completed, payment.processed)
- **WebSocket**: Real-time progress updates, live quiz participation

### 6. API Layer Implementation

**REST API:**

- Standard HTTP methods: GET, POST, PUT, PATCH, DELETE
- Swagger documentation (`@nestjs/swagger`)
- Versioning: `/api/v1/`
- Pagination, filtering, sorting via query params
- File uploads with multipart/form-data

**GraphQL API:**

- Apollo Server integration
- Code-first approach with `@nestjs/graphql`
- Resolvers for all entities
- DataLoader for N+1 problem prevention
- Subscriptions for real-time data
- GraphQL Playground at `/graphql`

**gRPC API:**

- Proto3 definitions in `apps/backend/src/grpc/proto/`
- Services for internal communication
- Example: User service, Course service
- Health checks and metadata

**WebSocket API:**

- Socket.io integration
- Namespaces: `/chat`, `/notifications`, `/live-updates`
- Authentication via JWT in handshake
- Room-based messaging
- Presence tracking

### 7. Frontend Setup (Next.js 16)

**Tech Stack:**

- **Framework**: Next.js 16 with App Router
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **State**: React Query (TanStack Query) + Zustand
- **Forms**: React Hook Form + Zod validation
- **GraphQL**: Apollo Client with code generation
- **WebSocket**: Socket.io client
- **Auth**: NextAuth.js with Keycloak provider
- **i18n**: next-intl for Arabic/English support
- **Icons**: Lucide React

**Frontend Structure:**

```
apps/web/
├── app/
│   ├── (auth)/               # Auth pages (login, register)
│   ├── (dashboard)/          # Protected dashboard layout
│   │   ├── courses/
│   │   ├── subscriptions/
│   │   ├── profile/
│   │   └── ...
│   ├── (public)/             # Public pages (landing, about)
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                   # Shadcn components
│   ├── forms/                # Form components
│   ├── layouts/              # Layout components
│   └── features/             # Feature-specific components
│       ├── courses/
│       ├── subscriptions/
│       └── ...
├── lib/
│   ├── api/                  # API clients (REST, GraphQL)
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utilities
│   └── validations/          # Zod schemas
├── stores/                   # Zustand stores
├── graphql/
│   ├── queries/
│   ├── mutations/
│   └── generated/            # GraphQL Codegen output
├── public/
└── next.config.js
```

**Key Features:**

- Server Components for SEO and performance
- Client Components for interactivity
- Optimistic updates with React Query
- Real-time updates via WebSocket
- Responsive design (mobile-first)
- Dark mode support
- Accessibility (WCAG AA)
- i18n routing (`/en/`, `/ar/`)

### 8. Seeders & Test Data

**Seeder Structure** ([`apps/backend/src/database/seeders/`](apps/backend/src/database/seeders/)):

```
seeders/
├── index.ts                  # Main seeder orchestrator
├── 01-lookups.seeder.ts      # Lookup types & lookups
├── 02-users.seeder.ts        # Admin, instructors, students
├── 03-plans.seeder.ts        # Subscription plans
├── 04-courses.seeder.ts      # Sample courses with sections/lessons
├── 05-enrollments.seeder.ts  # User enrollments
└── run-seeders.ts            # CLI script
```

**Seeder Data:**

- Lookup types: All categories from PRD (50+ types)
- Lookups: All lookup values (200+ entries)
- Users: 1 Admin, 5 Instructors, 20 Students
- Plans: 3 subscription tiers (Basic, Premium, Enterprise)
- Courses: 10 courses with 3-5 sections each, 5-10 lessons per section
- Enrollments: Random enrollments for students
- Resources: Sample PDFs, videos (mock URLs)

**Run Command:**

```bash
npm run seed           # Run all seeders
npm run seed:users     # Run specific seeder
npm run seed:reset     # Drop all data and reseed
```

### 9. Infrastructure Setup

**Docker Compose** ([`docker/docker-compose.yml`](docker/docker-compose.yml)):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: leap_lms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"

  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    ports:
      - "9092:9092"

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
```

**Environment Variables** ([`.env.example`](.env.example)):

```bash
# Database
DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Keycloak
KEYCLOAK_URL=https://your-keycloak-instance.com
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

# PayPal (Mock)
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_SECRET=your-sandbox-secret
PAYPAL_MODE=sandbox

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# FCM
FCM_PROJECT_ID=your-firebase-project
FCM_PRIVATE_KEY=your-service-account-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 10. Testing Strategy

**Backend Testing:**

- Unit tests: Services, utilities (Jest)
- Integration tests: Controllers, resolvers (Supertest)
- E2E tests: Full API flows (Supertest + Jest)
- Coverage target: 80%+

**Frontend Testing:**

- Component tests: React Testing Library
- E2E tests: Playwright
- Accessibility tests: jest-axe

### 11. Development Workflow

**Commands:**

```bash
# Install dependencies
npm install

# Start dev servers (Turborepo parallel execution)
npm run dev

# Build all apps
npm run build

# Lint & format
npm run lint
npm run format

# Run tests
npm run test

# Database operations
npm run db:generate     # Generate migrations
npm run db:push         # Push schema to DB
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
npm run seed            # Run seeders

# Docker
docker-compose -f docker/docker-compose.yml up -d
```

**Git Strategy:**

- Feature branches: `feature/module-name`
- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- PR reviews required
- CI/CD with GitHub Actions (lint, test, build)

## Implementation Todos

Each module will follow this pattern:

1. Create Drizzle schema
2. Generate and run migrations
3. Create NestJS module with CRUD operations
4. Implement REST endpoints (controllers)
5. Implement GraphQL resolvers
6. Implement gRPC services
7. Add WebSocket events (if applicable)
8. Create DTOs and validation
9. Add business logic and integrations
10. Create frontend components and pages
11. Add tests
12. Create seeder data

## Success Criteria

**Phase 1 Complete When:**

- ✅ Monorepo structure fully configured
- ✅ All infrastructure running (PostgreSQL, Redis, Kafka, RabbitMQ, MinIO)
- ✅ Database schemas created for all Phase 1 modules
- ✅ Keycloak integration working (login, JWT validation, roles)
- ✅ All 5 core modules implemented with full CRUD
- ✅ All API layers functional (REST, GraphQL, gRPC, WebSocket)
- ✅ Frontend can authenticate, view courses, manage subscriptions, enroll in courses
- ✅ Seeders populate realistic test data
- ✅ Documentation complete (README, API docs, architecture diagrams)

## Future Phases

**Phase 2: Social & Communication**

- Social module (posts, groups, pages, friends)
- Chat module (public/private messaging)
- Comments system (universal)
- Favorites & sharing modules

**Phase 3: Extended Features**

- Events module
- Jobs module
- Ticketing module (contact us, reports)
- CMS module (landing pages)
- Advanced notifications

**Phase 4: Optimization & Scale**

- Performance optimization
- Microservices architecture (if needed)
- Advanced caching strategies
- CDN integration
- Mobile apps (React Native)
- Advanced analytics and reporting