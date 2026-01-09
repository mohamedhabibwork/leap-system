# Database Package Cursor Rules

This directory contains Cursor AI rules specific to the Drizzle ORM database package.

## Rules Overview

### `drizzle-orm-rules.mdc`
Comprehensive guidelines for working with the database layer, including:
- Schema definition and organization
- Table and column types
- Constraints and indexes
- Relations (one-to-many, many-to-many)
- Database client configuration
- Query patterns and optimization
- Transactions
- Migrations
- Type safety and inference
- Seeding data
- Performance best practices

## When These Rules Apply

These rules automatically apply when working on files in the `packages/database/` directory, including:
- `src/schema/**/*.ts` (Schema definitions)
- `src/db.ts` (Database client)
- `src/types.ts` (Type definitions)
- `src/relations.ts` (Relation definitions)
- `drizzle.config.ts` (Drizzle configuration)
- `drizzle/**/*.sql` (Migration files)

## Tech Stack Reference

**Core:**
- Drizzle ORM 0.36+
- PostgreSQL 18
- node-postgres (pg)
- TypeScript 5.7+

**Tools:**
- Drizzle Kit (migrations)
- Drizzle Studio (database GUI)

## Schema Organization

```
src/
├── schema/
│   ├── auth/           # Auth tables
│   ├── lms/            # LMS core tables
│   ├── social/         # Social features
│   ├── payments/       # Payment tables
│   └── index.ts        # Export all schemas
├── relations.ts        # All relations
├── db.ts              # Database client
└── types.ts           # Inferred types
```

## Key Patterns

### Table Definition
```typescript
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  instructorId: integer('instructor_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  instructorIdx: index('courses_instructor_idx').on(table.instructorId),
  slugIdx: index('courses_slug_idx').on(table.slug),
}));
```

### Relations
```typescript
import { relations } from 'drizzle-orm';

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
}));
```

### Queries
```typescript
// Query API (with relations)
const course = await db.query.courses.findFirst({
  where: eq(courses.id, courseId),
  with: {
    instructor: true,
    lessons: true,
  },
});

// SQL-like API
const courses = await db
  .select()
  .from(courses)
  .where(eq(courses.isPublished, true))
  .orderBy(desc(courses.createdAt))
  .limit(10);
```

### Transactions
```typescript
await db.transaction(async (tx) => {
  const [enrollment] = await tx
    .insert(enrollments)
    .values({ userId, courseId })
    .returning();

  await tx
    .update(courses)
    .set({ enrollmentCount: sql`${courses.enrollmentCount} + 1` })
    .where(eq(courses.id, courseId));
});
```

### Type Inference
```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;

export type CourseWithInstructor = Course & {
  instructor: User;
};
```

## Available Scripts

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Database Conventions

1. **Naming:**
   - Use snake_case for tables and columns
   - Suffix junction tables with relationship (e.g., `course_tags`)
   - Use descriptive names (e.g., `created_at`, not `date`)

2. **Primary Keys:**
   - Use `serial('id')` for auto-increment
   - Use `uuid('id')` for distributed systems

3. **Timestamps:**
   - Always include `created_at` and `updated_at`
   - Use `defaultNow()` for creation timestamp

4. **Foreign Keys:**
   - Always define with `.references()`
   - Specify `onDelete` behavior (cascade, restrict, etc.)

5. **Indexes:**
   - Index all foreign keys
   - Index columns used in WHERE clauses
   - Use composite indexes for multi-column queries

6. **Constraints:**
   - Add NOT NULL for required fields
   - Use UNIQUE for unique fields
   - Add CHECK constraints for validation

## Performance Tips

- Use indexes on frequently queried columns
- Avoid N+1 queries by using relations
- Use pagination for large result sets
- Keep transactions short and focused
- Use prepared statements for repeated queries
- Monitor query performance with EXPLAIN ANALYZE

## Migration Best Practices

- Review generated SQL before applying
- Test migrations on staging first
- Keep migrations small and focused
- Include both up and down migrations
- Add indexes in separate migrations if needed
- Be careful with data migrations on large tables

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database ERD](../../../leap_lms_erd.md)
- [Project README](../../../README.md)

## Integration with Apps

Both the backend (NestJS) and frontend (Next.js) consume this package:

```typescript
// Backend usage
import { db } from '@leap-lms/database';
import { courses, users } from '@leap-lms/database/schema';

// Frontend Server Actions
import { db } from '@leap-lms/database';
import { courses } from '@leap-lms/database/schema';
```

The database package provides type-safe access to the PostgreSQL database for all applications in the monorepo.
