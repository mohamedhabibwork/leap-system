# Cursor Rules - LEAP LMS Platform

This directory contains workspace-level Cursor AI rules that apply across the entire monorepo. Additional app-specific and package-specific rules are located in their respective directories.

## Rules Structure

```
leapv2-system/
├── .cursor/rules/                          # Workspace-level rules (this directory)
│   ├── general-project-rules.mdc          # General TypeScript & architecture
│   ├── typescript.mdc                     # TypeScript best practices
│   ├── next-js-server-component-rules.mdc # Next.js RSC patterns
│   ├── ai-sdk-rsc-integration-rules.mdc   # AI SDK integration
│   ├── ui-component-styling-rules.mdc     # Shadcn UI & Tailwind
│   ├── image-optimization-rules.mdc       # Image optimization
│   ├── middleware-implementation-rules.mdc # Vercel middleware
│   ├── performance-optimization-rules.mdc  # Web Vitals & performance
│   ├── vercel-kv-database-rules.mdc       # Vercel KV usage
│   ├── general-typescript-rules.mdc       # General TS conventions
│   └── README.md                          # This file
│
├── apps/backend/.cursor/rules/             # Backend-specific rules
│   ├── backend-nestjs-rules.mdc           # NestJS patterns & best practices
│   └── README.md
│
├── apps/web/.cursor/rules/                 # Frontend-specific rules
│   ├── frontend-nextjs-rules.mdc          # Next.js App Router patterns
│   └── README.md
│
└── packages/database/.cursor/rules/        # Database-specific rules
    ├── drizzle-orm-rules.mdc              # Drizzle ORM patterns
    └── README.md
```

## Rule Hierarchy

Cursor AI applies rules in the following order (most specific to least specific):

1. **App/Package-Specific Rules** - Rules in `apps/*/` or `packages/*/.cursor/rules/`
2. **Workspace-Level Rules** - Rules in this directory (`.cursor/rules/`)
3. **Global User Rules** - User's global Cursor settings

More specific rules take precedence over general ones.

## Workspace-Level Rules Overview

### General Project Rules

**File:** `general-project-rules.mdc`
- Expert in TypeScript, Node.js, Next.js, React
- Shadcn UI, Radix UI, Tailwind CSS patterns
- Vercel middleware usage
- Applies to: `**/*.*`

### TypeScript Best Practices

**Files:** `typescript.mdc`, `general-typescript-rules.mdc`
- TypeScript strict mode conventions
- Interface over type preference
- Type safety patterns
- Applies to: `**/*.ts`, `**/*.tsx`, `**/*.d.ts`

### Next.js Server Components

**File:** `next-js-server-component-rules.mdc`
- Minimize `use client` directive
- Prefer React Server Components
- Avoid unnecessary `useEffect` and `setState`
- Applies to: `app/**/*.tsx`

### AI SDK Integration

**File:** `ai-sdk-rsc-integration-rules.mdc`
- Integrate `ai-sdk-rsc` into Next.js
- Applies to: `**/*.tsx`

### UI Component Styling

**File:** `ui-component-styling-rules.mdc`
- Use Shadcn UI, Radix UI, and Tailwind
- Component styling patterns
- Applies to: `components/**/*.{js,jsx,ts,tsx}`

### Image Optimization

**File:** `image-optimization-rules.mdc`
- Use WebP format
- Include size data
- Implement lazy loading
- Applies to: `components/**/*.{js,jsx,ts,tsx}`

### Middleware Implementation

**File:** `middleware-implementation-rules.mdc`
- Use Vercel middleware for request handling
- Applies to: `middleware.ts`

### Performance Optimization

**File:** `performance-optimization-rules.mdc`
- Optimize Web Vitals (LCP, CLS, FID)
- Applies to: `**/*.{js,jsx,ts,tsx}`

### Vercel KV Database

**File:** `vercel-kv-database-rules.mdc`
- Use Vercel KV for session data
- Applies to: `**/*.ts`

## App-Specific Rules

### Backend (NestJS)

**Location:** `apps/backend/.cursor/rules/`

Comprehensive rules for the NestJS backend covering:
- Module, controller, and service patterns
- DTOs and validation with class-validator
- Drizzle ORM database queries
- Authentication (Keycloak OIDC + JWT)
- Authorization (RBAC with guards)
- GraphQL resolvers and schemas
- WebSocket gateways (Socket.io)
- Microservices (RabbitMQ, Kafka)
- Redis caching strategies
- File storage (MinIO/S3)
- Error handling and logging
- Testing (unit and E2E)
- API documentation (Swagger)

**Tech Stack:**
- NestJS 10.4+
- PostgreSQL 18 (Drizzle ORM)
- Redis 7
- RabbitMQ 3
- Apache Kafka 2.2
- MinIO (S3-compatible)
- Keycloak 23
- GraphQL (Apollo Server)
- Socket.io

### Frontend (Next.js)

**Location:** `apps/web/.cursor/rules/`

Comprehensive rules for the Next.js frontend covering:
- Next.js 16 App Router patterns
- React 19 Server Components
- Client Components best practices
- Server Actions for mutations
- NextAuth.js authentication
- TanStack Query for data fetching
- Apollo Client for GraphQL
- Zustand state management
- Socket.io real-time features
- Tailwind CSS styling
- Shadcn UI + Radix UI components
- Forms with React Hook Form + Zod
- SEO and metadata
- Performance optimization
- Accessibility (WCAG 2.1)

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- NextAuth.js 4
- TanStack Query 5
- Apollo Client 4
- Zustand 5
- Socket.io Client 4
- Tailwind CSS 4
- Shadcn UI + Radix UI

## Package-Specific Rules

### Database (Drizzle ORM)

**Location:** `packages/database/.cursor/rules/`

Comprehensive rules for the database layer covering:
- Schema definition and organization
- Table and column types
- Constraints and indexes
- Relations (one-to-many, many-to-many)
- Database client configuration
- Query patterns (Query API vs SQL-like API)
- Transactions and atomicity
- Migrations with Drizzle Kit
- Type safety and type inference
- Seeding data
- Performance optimization
- N+1 query prevention

**Tech Stack:**
- Drizzle ORM 0.36+
- PostgreSQL 18
- node-postgres (pg)
- Drizzle Kit

## When Rules Apply

Cursor AI automatically applies the appropriate rules based on:

1. **File Path**: Rules target specific directories and file patterns
2. **File Extension**: TypeScript, React, etc.
3. **Glob Patterns**: Defined in each rule file

### Examples:

- `apps/backend/src/modules/users/users.controller.ts`
  - ✅ Workspace TypeScript rules
  - ✅ Backend NestJS rules
  - ✅ Controller-specific patterns

- `apps/web/app/(dashboard)/courses/page.tsx`
  - ✅ Workspace TypeScript rules
  - ✅ Workspace Next.js RSC rules
  - ✅ Frontend Next.js rules
  - ✅ Server Component patterns

- `packages/database/src/schema/lms/courses.ts`
  - ✅ Workspace TypeScript rules
  - ✅ Database Drizzle ORM rules
  - ✅ Schema definition patterns

## Best Practices Summary

### TypeScript
- Use strict mode
- Prefer interfaces over types
- Avoid enums; use const objects or union types
- Leverage type inference
- Define proper return types

### Architecture
- Modular structure by feature
- Dependency injection (backend)
- Server Components by default (frontend)
- Type-safe database queries
- Proper error handling

### Performance
- Database indexes on frequently queried columns
- Avoid N+1 queries
- Implement pagination
- Use Redis caching (backend)
- Optimize images (frontend)
- Code splitting (frontend)
- Lazy loading

### Security
- Never commit secrets
- Use environment variables
- Input validation on all endpoints
- Sanitize user inputs
- Implement rate limiting
- Use HTTPS in production
- Proper authentication and authorization

### Testing
- Unit tests for business logic
- E2E tests for critical flows
- Mock external dependencies
- Test error scenarios
- Maintain high coverage

## Project Context

**LEAP LMS Platform** - A production-ready Learning Management System built with modern technologies:

- 🎯 20 Backend Modules with 120+ REST endpoints
- 🗄️ 40+ Database Tables with comprehensive relationships
- 🔐 Enterprise Authentication (Keycloak OIDC + JWT)
- 📚 Complete LMS features (courses, lessons, quizzes, certificates)
- 💳 Subscription and payment processing
- 💬 Social learning (posts, groups, chat)
- 🔔 Multi-channel notifications
- 📊 Real-time features (WebSocket)
- 🚀 Production-ready with Docker
- 📖 Comprehensive API documentation

## Additional Resources

- [Project README](../../README.md)
- [Implementation Status](../../IMPLEMENTATION_STATUS.md)
- [Development Guide](../../DEVELOPMENT_GUIDE.md)
- [ERD Diagram](../../leap_lms_erd.md)
- [PRD Document](../../leap_lms_prd.md)

## Contributing to Rules

When adding new rules:

1. **Choose the Right Location:**
   - Workspace-level for cross-cutting concerns
   - App-specific for technology-specific patterns
   - Package-specific for library/tool patterns

2. **Use Clear Glob Patterns:**
   - Be specific about file paths
   - Use appropriate wildcards

3. **Provide Examples:**
   - Include code examples
   - Show both good and bad patterns
   - Explain the reasoning

4. **Keep Rules Focused:**
   - One concern per rule file
   - Clear and concise guidelines
   - Avoid duplication

5. **Update Documentation:**
   - Update the relevant README
   - Document when rules apply
   - Provide context and examples

## Rule Effectiveness

These rules help ensure:

✅ **Consistency** - Uniform patterns across the codebase
✅ **Quality** - Best practices enforced automatically
✅ **Speed** - Faster development with guided patterns
✅ **Onboarding** - New developers understand conventions quickly
✅ **Maintainability** - Easier to maintain and extend
✅ **Type Safety** - Proper TypeScript usage throughout
✅ **Performance** - Optimized patterns from the start
✅ **Security** - Security best practices embedded

---

*Last Updated: January 2026*
