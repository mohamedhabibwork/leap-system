# 🎯 Cursor Rules Guide - LEAP PM Platform

> Complete guide to Cursor AI rules configuration for the LEAP PM monorepo

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Rules Architecture](#rules-architecture)
- [Rule Files Reference](#rule-files-reference)
- [Usage Examples](#usage-examples)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This monorepo includes comprehensive Cursor AI rules that provide context-aware coding assistance for:

- ✅ **Backend Development** (NestJS + PostgreSQL + Redis + Kafka)
- ✅ **Frontend Development** (Next.js + React + TanStack Query)
- ✅ **Database Layer** (Drizzle ORM + PostgreSQL)
- ✅ **TypeScript Best Practices**
- ✅ **Performance Optimization**
- ✅ **Security Patterns**

### Benefits

- 🚀 **Faster Development** - Pre-configured patterns and examples
- 🎯 **Consistency** - Uniform code style across team
- 📚 **Learning** - Best practices embedded in AI suggestions
- 🔒 **Quality** - Security and performance patterns enforced
- 🤖 **Smart Context** - Rules activate based on file location

---

## ⚡ Quick Start

### 1. Rules Are Already Configured

The rules are already in place. Just start coding, and Cursor will automatically apply the appropriate rules based on your file location.

### 2. Verify Rules Are Active

When editing files, check that Cursor AI is providing context-aware suggestions based on:

- **File Location** (backend, frontend, database)
- **File Type** (.ts, .tsx, .controller.ts, etc.)
- **Technology Stack** (NestJS, Next.js, Drizzle ORM)

### 3. Explore Rules

Browse the rules to understand patterns:

```bash
# Workspace-level rules
ls .cursor/rules/

# Backend-specific rules
ls apps/backend/.cursor/rules/

# Frontend-specific rules
ls apps/web/.cursor/rules/

# Database-specific rules
ls packages/database/.cursor/rules/
```

---

## 🏗️ Rules Architecture

### Hierarchy

```
┌─────────────────────────────────────────┐
│   App/Package-Specific Rules           │  ← Most Specific
│   (apps/*, packages/*)                 │
├─────────────────────────────────────────┤
│   Workspace-Level Rules                │  ← General
│   (.cursor/rules/)                     │
├─────────────────────────────────────────┤
│   Global User Rules                    │  ← Least Specific
│   (Cursor Settings)                    │
└─────────────────────────────────────────┘
```

More specific rules override general ones.

### Directory Structure

```
leapv2-system/
│
├── .cursor/rules/                          # 🌍 Workspace Rules
│   ├── general-project-rules.mdc
│   ├── typescript.mdc
│   ├── next-js-server-component-rules.mdc
│   ├── ui-component-styling-rules.mdc
│   ├── performance-optimization-rules.mdc
│   └── ... (9 total rule files)
│
├── apps/
│   ├── backend/.cursor/rules/              # 🎯 Backend Rules
│   │   ├── backend-nestjs-rules.mdc
│   │   └── README.md
│   │
│   └── web/.cursor/rules/                  # 🎯 Frontend Rules
│       ├── frontend-nextjs-rules.mdc
│       └── README.md
│
└── packages/
    └── database/.cursor/rules/             # 🎯 Database Rules
        ├── drizzle-orm-rules.mdc
        └── README.md
```

---

## 📚 Rule Files Reference

### Workspace-Level Rules (`.cursor/rules/`)

| File | Purpose | Applies To |
|------|---------|------------|
| `general-project-rules.mdc` | TypeScript, Node.js, React patterns | `**/*.*` |
| `typescript.mdc` | TypeScript best practices | `**/*.ts`, `**/*.tsx` |
| `general-typescript-rules.mdc` | General TS conventions | `**/*.ts` |
| `next-js-server-component-rules.mdc` | React Server Components | `app/**/*.tsx` |
| `ai-sdk-rsc-integration-rules.mdc` | AI SDK integration | `**/*.tsx` |
| `ui-component-styling-rules.mdc` | Shadcn UI + Tailwind | `components/**/*` |
| `image-optimization-rules.mdc` | Image optimization | `components/**/*` |
| `middleware-implementation-rules.mdc` | Vercel middleware | `middleware.ts` |
| `performance-optimization-rules.mdc` | Web Vitals | `**/*.{js,jsx,ts,tsx}` |
| `vercel-kv-database-rules.mdc` | Vercel KV | `**/*.ts` |

### Backend Rules (`apps/backend/.cursor/rules/`)

| File | Purpose | Key Topics |
|------|---------|------------|
| `backend-nestjs-rules.mdc` | Complete NestJS guide | Modules, Controllers, Services, DTOs, GraphQL, WebSocket, Microservices, Redis, Auth |

**Covers:**
- 🏗️ NestJS Architecture & Module Structure
- 🔐 Authentication (Keycloak OIDC + JWT)
- 📊 Database (Drizzle ORM Patterns)
- 🔄 GraphQL (Apollo Server)
- 🌐 WebSocket (Socket.io)
- 📬 Microservices (RabbitMQ, Kafka)
- 💾 Caching (Redis)
- 📁 Storage (MinIO/S3)
- ✅ Validation & Error Handling
- 🧪 Testing Strategies

### Frontend Rules (`apps/web/.cursor/rules/`)

| File | Purpose | Key Topics |
|------|---------|------------|
| `frontend-nextjs-rules.mdc` | Complete Next.js guide | App Router, RSC, Client Components, Server Actions, Auth, State, Real-time |

**Covers:**
- 🎨 Next.js 16 App Router
- ⚛️ React 19 Server Components
- 🔐 NextAuth.js Authentication
- 🔄 TanStack Query (Data Fetching)
- 🗄️ Apollo Client (GraphQL)
- 📦 Zustand (State Management)
- 🌐 Socket.io Client (Real-time)
- 💅 Tailwind CSS + Shadcn UI
- 📝 Forms (React Hook Form + Zod)
- 🚀 Performance & SEO

### Database Rules (`packages/database/.cursor/rules/`)

| File | Purpose | Key Topics |
|------|---------|------------|
| `drizzle-orm-rules.mdc` | Complete Drizzle ORM guide | Schemas, Relations, Queries, Transactions, Migrations, Performance |

**Covers:**
- 📋 Schema Definition & Organization
- 🔗 Relations (One-to-Many, Many-to-Many)
- 🗃️ Column Types & Constraints
- 🔍 Query Patterns (Query API vs SQL-like)
- 🔄 Transactions & Atomicity
- 📦 Migrations with Drizzle Kit
- 🎯 Type Safety & Inference
- ⚡ Performance & Indexing
- 🌱 Seeding Data

---

## 💡 Usage Examples

### Example 1: Creating a NestJS Controller

**File:** `apps/backend/src/modules/courses/courses.controller.ts`

**Active Rules:**
- ✅ Workspace TypeScript rules
- ✅ Backend NestJS rules
- ✅ Controller patterns

**What Cursor Knows:**
- Use `@Controller()` decorator
- Apply `@UseGuards(JwtAuthGuard)` for auth
- Use proper HTTP decorators (`@Get()`, `@Post()`, etc.)
- Document with `@ApiTags()` and `@ApiOperation()`
- Keep controllers thin, delegate to services

**Example Code:**

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async findAll() {
    return this.coursesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }
}
```

### Example 2: Creating a Next.js Server Component

**File:** `apps/web/app/(dashboard)/courses/page.tsx`

**Active Rules:**
- ✅ Workspace TypeScript rules
- ✅ Workspace Next.js RSC rules
- ✅ Frontend Next.js rules
- ✅ Server Component patterns

**What Cursor Knows:**
- Default to Server Components (no `'use client'`)
- Fetch data directly in component
- Use Server Actions for mutations
- Implement proper metadata
- Handle loading and error states

**Example Code:**

```typescript
import { Metadata } from 'next';
import { getCoursesAction } from '@/lib/actions/courses';
import CourseList from '@/components/features/courses/CourseList';

export const metadata: Metadata = {
  title: 'Courses | LEAP PM',
  description: 'Browse our collection of courses',
};

export default async function CoursesPage() {
  const courses = await getCoursesAction();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      <CourseList courses={courses} />
    </div>
  );
}
```

### Example 3: Creating a Database Schema

**File:** `packages/database/src/schema/lms/courses.ts`

**Active Rules:**
- ✅ Workspace TypeScript rules
- ✅ Database Drizzle ORM rules
- ✅ Schema definition patterns

**What Cursor Knows:**
- Use `pgTable` for tables
- Use snake_case for names
- Include timestamps
- Add proper indexes
- Define foreign key constraints

**Example Code:**

```typescript
import { pgTable, serial, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from '../auth/users';

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  instructorId: integer('instructor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  price: integer('price').default(0),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  instructorIdx: index('courses_instructor_idx').on(table.instructorId),
  slugIdx: index('courses_slug_idx').on(table.slug),
  publishedIdx: index('courses_published_idx').on(table.isPublished),
}));
```

---

## 🎨 Customization

### Adding New Rules

1. **Choose Location:**
   - Workspace-level: `.cursor/rules/`
   - App-specific: `apps/[app]/.cursor/rules/`
   - Package-specific: `packages/[package]/.cursor/rules/`

2. **Create Rule File:**
   ```markdown
   # Rule Title

   You are an expert in [technologies].

   ## Guidelines

   - Guideline 1
   - Guideline 2

   ## Examples

   ```typescript
   // Example code
   ```
   ```

3. **Specify Glob Pattern:**
   Add glob pattern comment at top of file:
   ```markdown
   glob pattern(s) for applicable files: **/*.ts, **/*.tsx
   ```

4. **Update README:**
   Document the new rule in the appropriate README file.

### Modifying Existing Rules

1. Open the rule file in `.cursor/rules/` or app-specific directory
2. Make your changes
3. Save the file (rules apply immediately)
4. Update the README if needed

### Disabling Rules

To temporarily disable a rule:

1. Rename the file extension from `.mdc` to `.mdc.disabled`
2. Restart Cursor or reload the window

---

## 🔧 Troubleshooting

### Rules Not Applying

**Problem:** Cursor AI doesn't seem to follow the rules.

**Solutions:**
1. **Reload Window:** Cmd+Shift+P → "Reload Window"
2. **Check File Location:** Ensure file is in the right directory for rules to apply
3. **Verify Glob Pattern:** Check if file matches the rule's glob pattern
4. **Check File Extension:** Rules apply to `.mdc` files

### Conflicting Suggestions

**Problem:** AI provides suggestions that contradict the rules.

**Solutions:**
1. **Be Explicit:** Ask Cursor to follow specific rule patterns
2. **Reference Rule:** Mention the rule file name in your prompt
3. **Check Hierarchy:** More specific rules override general ones

### Performance Issues

**Problem:** Cursor feels slow with many rules.

**Solutions:**
1. **Remove Unused Rules:** Delete rules that don't apply to your project
2. **Reduce Overlap:** Consolidate similar rules
3. **Optimize Patterns:** Use specific glob patterns instead of broad ones

---

## 📖 Additional Resources

- [Cursor Documentation](https://docs.cursor.sh/)
- [Project README](./README.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Backend Rules](./apps/backend/.cursor/rules/README.md)
- [Frontend Rules](./apps/web/.cursor/rules/README.md)
- [Database Rules](./packages/database/.cursor/rules/README.md)

---

## 🤝 Contributing

When contributing to the rules:

1. Follow existing patterns and structure
2. Include clear examples (good and bad)
3. Update all relevant README files
4. Test rules with various file types
5. Document glob patterns clearly

---

## 📝 Summary

| Location | Purpose | Files |
|----------|---------|-------|
| `.cursor/rules/` | Workspace-wide patterns | 10 files |
| `apps/backend/.cursor/rules/` | NestJS backend | 1 comprehensive file |
| `apps/web/.cursor/rules/` | Next.js frontend | 1 comprehensive file |
| `packages/database/.cursor/rules/` | Drizzle ORM | 1 comprehensive file |

**Total:** 13+ comprehensive rule files covering all aspects of development.

---

*Built with ❤️ for the LEAP PM Platform | Last Updated: January 2026*
