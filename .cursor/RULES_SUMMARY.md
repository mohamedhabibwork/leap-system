# Cursor Rules Summary - Quick Reference

> Quick reference for all Cursor AI rules in the LEAP PM monorepo

## 📁 Files Created

### Workspace-Level Rules (Already Existed)
✅ `.cursor/rules/general-project-rules.mdc` - General TypeScript & architecture
✅ `.cursor/rules/typescript.mdc` - TypeScript best practices
✅ `.cursor/rules/general-typescript-rules.mdc` - General TS conventions
✅ `.cursor/rules/next-js-server-component-rules.mdc` - Next.js RSC patterns
✅ `.cursor/rules/ai-sdk-rsc-integration-rules.mdc` - AI SDK integration
✅ `.cursor/rules/ui-component-styling-rules.mdc` - Shadcn UI & Tailwind
✅ `.cursor/rules/image-optimization-rules.mdc` - Image optimization
✅ `.cursor/rules/middleware-implementation-rules.mdc` - Vercel middleware
✅ `.cursor/rules/performance-optimization-rules.mdc` - Web Vitals
✅ `.cursor/rules/vercel-kv-database-rules.mdc` - Vercel KV

### New App-Specific Rules
🆕 `apps/backend/.cursor/rules/backend-nestjs-rules.mdc` - **Complete NestJS guide**
🆕 `apps/backend/.cursor/rules/README.md` - Backend rules documentation

🆕 `apps/web/.cursor/rules/frontend-nextjs-rules.mdc` - **Complete Next.js guide**
🆕 `apps/web/.cursor/rules/README.md` - Frontend rules documentation

### New Package-Specific Rules
🆕 `packages/database/.cursor/rules/drizzle-orm-rules.mdc` - **Complete Drizzle ORM guide**
🆕 `packages/database/.cursor/rules/README.md` - Database rules documentation

### Documentation Files
🆕 `.cursor/rules/README.md` - Master rules overview
🆕 `CURSOR_RULES_GUIDE.md` - Complete usage guide
🆕 `.cursor/RULES_SUMMARY.md` - This file

**Total:** 20 files (10 existing + 10 new)

---

## 🎯 Quick Access

### For Backend Development
```bash
# View backend rules
cat apps/backend/.cursor/rules/backend-nestjs-rules.mdc

# View backend README
cat apps/backend/.cursor/rules/README.md
```

**Key Topics:**
- NestJS modules, controllers, services
- DTOs and validation
- Drizzle ORM queries
- Authentication (Keycloak + JWT)
- GraphQL resolvers
- WebSocket gateways
- Microservices (RabbitMQ, Kafka)
- Redis caching
- File storage (MinIO)

### For Frontend Development
```bash
# View frontend rules
cat apps/web/.cursor/rules/frontend-nextjs-rules.mdc

# View frontend README
cat apps/web/.cursor/rules/README.md
```

**Key Topics:**
- Next.js App Router
- React Server Components
- Server Actions
- NextAuth.js
- TanStack Query
- Apollo Client (GraphQL)
- Zustand state
- Socket.io client
- Tailwind + Shadcn UI

### For Database Work
```bash
# View database rules
cat packages/database/.cursor/rules/drizzle-orm-rules.mdc

# View database README
cat packages/database/.cursor/rules/README.md
```

**Key Topics:**
- Schema definition
- Relations
- Queries (Query API vs SQL-like)
- Transactions
- Migrations
- Type safety
- Performance optimization

### For General Guidelines
```bash
# View all workspace rules
ls -la .cursor/rules/

# View master overview
cat .cursor/rules/README.md

# View complete guide
cat CURSOR_RULES_GUIDE.md
```

---

## 🔥 Most Important Rules

### Backend (NestJS)

**Rule:** `apps/backend/.cursor/rules/backend-nestjs-rules.mdc`

**Must Know Patterns:**

1. **Controller Pattern:**
```typescript
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }
}
```

2. **Service Pattern:**
```typescript
@Injectable()
export class CoursesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query.courses.findMany({
      where: eq(courses.isPublished, true),
    });
  }
}
```

3. **DTO Pattern:**
```typescript
export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  description: string;
}
```

### Frontend (Next.js)

**Rule:** `apps/web/.cursor/rules/frontend-nextjs-rules.mdc`

**Must Know Patterns:**

1. **Server Component (Default):**
```typescript
// No 'use client' - it's a Server Component
export default async function CoursesPage() {
  const courses = await getCoursesAction();
  return <CourseList courses={courses} />;
}
```

2. **Client Component:**
```typescript
'use client';

import { useState } from 'react';

export default function CourseCard({ course }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
}
```

3. **Server Action:**
```typescript
'use server';

export async function createCourseAction(formData: FormData) {
  const course = await db.insert(courses).values({
    title: formData.get('title'),
  });
  revalidatePath('/courses');
  return { success: true };
}
```

### Database (Drizzle ORM)

**Rule:** `packages/database/.cursor/rules/drizzle-orm-rules.mdc`

**Must Know Patterns:**

1. **Schema Definition:**
```typescript
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  instructorId: integer('instructor_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  instructorIdx: index().on(table.instructorId),
}));
```

2. **Relations:**
```typescript
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  lessons: many(lessons),
}));
```

3. **Queries:**
```typescript
// With relations
const course = await db.query.courses.findFirst({
  where: eq(courses.id, courseId),
  with: {
    instructor: true,
    lessons: true,
  },
});
```

---

## 📊 Rules Coverage Matrix

| Technology | Rule File | Lines | Completeness |
|------------|-----------|-------|--------------|
| **NestJS** | `backend-nestjs-rules.mdc` | ~850 | ✅ Complete |
| **Next.js** | `frontend-nextjs-rules.mdc` | ~950 | ✅ Complete |
| **Drizzle ORM** | `drizzle-orm-rules.mdc` | ~750 | ✅ Complete |
| **TypeScript** | `typescript.mdc` | ~150 | ✅ Complete |
| **Tailwind** | `ui-component-styling-rules.mdc` | ~100 | ✅ Complete |

**Total Lines of Rules:** ~3,000+ lines of comprehensive guidance

---

## 🎓 Learning Path

### 1. Start Here (5 min)
- Read: `CURSOR_RULES_GUIDE.md`
- Understand the hierarchy and structure

### 2. Explore Workspace Rules (10 min)
- Browse: `.cursor/rules/`
- Focus on TypeScript and general patterns

### 3. Deep Dive: Your Primary Area (30 min)

**Backend Developers:**
- Study: `apps/backend/.cursor/rules/backend-nestjs-rules.mdc`
- Practice: Create a new module following patterns

**Frontend Developers:**
- Study: `apps/web/.cursor/rules/frontend-nextjs-rules.mdc`
- Practice: Create a new page with Server Components

**Database Work:**
- Study: `packages/database/.cursor/rules/drizzle-orm-rules.mdc`
- Practice: Define a new schema with relations

### 4. Reference as Needed
- Keep README files open for quick reference
- Use Cmd+P to quickly open rule files
- Ask Cursor to follow specific patterns

---

## 💡 Pro Tips

### 1. Reference Rules in Prompts
```
"Create a NestJS controller following the backend-nestjs-rules patterns"
```

### 2. Ask for Specific Patterns
```
"Show me the Server Action pattern from frontend-nextjs-rules"
```

### 3. Verify Against Rules
```
"Does this code follow the drizzle-orm-rules for schema definition?"
```

### 4. Learn by Example
All rule files include extensive code examples. Study them!

### 5. Keep Rules Updated
As the project evolves, update rules to reflect new patterns.

---

## 🔍 Finding Relevant Rules

### By File Type

- **`.controller.ts`** → Backend NestJS rules
- **`.service.ts`** → Backend NestJS rules
- **`.dto.ts`** → Backend NestJS rules (DTOs section)
- **`.resolver.ts`** → Backend NestJS rules (GraphQL section)
- **`page.tsx`** → Frontend Next.js rules (Server Components)
- **`layout.tsx`** → Frontend Next.js rules (Layouts section)
- **`schema/*.ts`** → Database Drizzle ORM rules
- **`components/*.tsx`** → UI styling rules + Frontend rules

### By Task

- **Authentication** → Backend rules (Auth section) + Frontend rules (NextAuth section)
- **Database Queries** → Database rules (Queries section) + Backend rules (Database section)
- **Real-time Features** → Backend rules (WebSocket) + Frontend rules (Socket.io)
- **Forms** → Frontend rules (Forms section)
- **API Endpoints** → Backend rules (Controllers section)
- **State Management** → Frontend rules (Zustand section)
- **Styling** → UI styling rules + Frontend rules (Tailwind section)

---

## 📈 Rules Stats

```
Total Rule Files: 20
├── Workspace Rules: 10
├── Backend Rules: 2
├── Frontend Rules: 2
├── Database Rules: 2
└── Documentation: 4

Total Lines: ~3,500+
Total Examples: 100+
Technologies Covered: 20+
```

---

## ✅ Checklist: Are Rules Working?

Test your setup:

- [ ] Open a backend controller file - do suggestions follow NestJS patterns?
- [ ] Open a frontend page file - do suggestions prefer Server Components?
- [ ] Open a schema file - do suggestions use Drizzle ORM patterns?
- [ ] Create a new file - does Cursor suggest appropriate patterns?
- [ ] Ask Cursor about patterns - does it reference the rules?

If all checked ✅, rules are working!

---

## 🆘 Need Help?

1. **Read the relevant README:**
   - Backend: `apps/backend/.cursor/rules/README.md`
   - Frontend: `apps/web/.cursor/rules/README.md`
   - Database: `packages/database/.cursor/rules/README.md`

2. **Check the complete guide:**
   - `CURSOR_RULES_GUIDE.md`

3. **Review the master overview:**
   - `.cursor/rules/README.md`

4. **Look at existing code:**
   - Backend modules: `apps/backend/src/modules/`
   - Frontend pages: `apps/web/app/`
   - Database schemas: `packages/database/src/schema/`

---

## 🎉 You're Ready!

All Cursor rules are configured and documented. Start coding, and Cursor will guide you with context-aware suggestions based on:

✅ Your file location
✅ The technology stack
✅ Best practices
✅ Security patterns
✅ Performance optimizations
✅ Type safety

**Happy coding! 🚀**

---

*Quick Reference for LEAP PM Platform | January 2026*
