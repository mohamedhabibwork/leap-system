# Frontend Cursor Rules

This directory contains Cursor AI rules specific to the Next.js frontend application.

## Rules Overview

### `frontend-nextjs-rules.mdc`
Comprehensive guidelines for developing the Next.js frontend, including:
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
- Forms and validation
- SEO and metadata
- Performance optimization
- Security best practices

## When These Rules Apply

These rules automatically apply when working on files in the `apps/web/` directory, including:
- `*.tsx` files (React/TypeScript components)
- `*.ts` files (TypeScript utilities)
- `app/**/page.tsx` (Next.js pages)
- `app/**/layout.tsx` (Next.js layouts)
- `app/**/loading.tsx` (Loading states)
- `app/**/error.tsx` (Error boundaries)
- `components/**/*` (React components)
- `lib/**/*` (Utilities and helpers)

## Tech Stack Reference

**Core:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5+
- Node.js 20+

**Data Fetching:**
- TanStack React Query 5
- Apollo Client 4 (GraphQL)
- Server Actions

**State & Real-time:**
- Zustand 5
- Socket.io Client 4

**Styling:**
- Tailwind CSS 4
- Shadcn UI
- Radix UI

**Authentication:**
- NextAuth.js 4

## Key Patterns

### File Structure
```
app/
├── (auth)/              # Auth route group
│   ├── login/
│   └── register/
├── (dashboard)/         # Protected routes
│   ├── courses/
│   └── profile/
├── api/                 # API routes
└── layout.tsx           # Root layout

components/
├── ui/                  # Shadcn components
├── features/            # Feature components
└── shared/              # Shared components

lib/
├── api/                 # API clients
├── stores/              # Zustand stores
└── utils/               # Utilities
```

### Server Component (Default)
```typescript
// app/courses/page.tsx
import { getCoursesAction } from '@/lib/actions/courses';

export default async function CoursesPage() {
  const courses = await getCoursesAction();

  return (
    <div>
      <h1>Courses</h1>
      <CourseList courses={courses} />
    </div>
  );
}
```

### Client Component
```typescript
'use client';

import { useState } from 'react';

export default function CourseCard({ course }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div>
      <h3>{course.title}</h3>
      <button onClick={() => setIsLiked(!isLiked)}>
        {isLiked ? 'Unlike' : 'Like'}
      </button>
    </div>
  );
}
```

### Server Action
```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createCourseAction(formData: FormData) {
  const title = formData.get('title') as string;

  // Validate and create course
  const course = await db.insert(courses).values({ title });

  revalidatePath('/courses');
  return { success: true, course };
}
```

### TanStack Query Hook
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/v1/courses');
      return res.json();
    },
  });
}
```

## Design Principles

1. **Minimize Client Components**: Use Server Components by default
2. **Server Actions**: Use for mutations instead of API routes
3. **Progressive Enhancement**: Build with JavaScript disabled in mind
4. **Type Safety**: Leverage TypeScript for all code
5. **Performance**: Optimize images, lazy load, code split
6. **Accessibility**: Follow WCAG 2.1 guidelines
7. **SEO**: Implement proper metadata and structured data

## Component Libraries

### Shadcn UI Components
Pre-built, customizable components in `components/ui/`:
- Button, Input, Card, Dialog
- Select, Checkbox, Radio
- Dropdown, Popover, Tooltip
- Table, Form, Tabs
- And many more...

### Usage
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Card>
  <Button variant="default">Click me</Button>
  <Button variant="outline">Cancel</Button>
</Card>
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)
- [Project README](../../../README.md)
- [Frontend Package.json](../package.json)

## Workspace-Level Rules

These app-specific rules complement the workspace-level rules in `.cursor/rules/` at the project root. The workspace rules cover:
- TypeScript best practices
- Next.js Server Component patterns
- UI component styling (Shadcn UI, Tailwind)
- Image optimization
- Performance optimization
- Middleware implementation

Check the workspace rules for additional guidance applicable across all apps.
