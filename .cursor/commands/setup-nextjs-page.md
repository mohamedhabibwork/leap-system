# Setup Next.js Page

Scaffold a complete Next.js page with Server Component, Client Component (if needed), and API route following project conventions.

## Steps

1. **Prompt for page details**
   - Page route path (e.g., `/courses/[id]`, `/dashboard`)
   - Page type (Server Component, Client Component, or hybrid)
   - Required data fetching
   - Required interactivity

2. **Create page structure**
   ```
   apps/web/app/[locale]/{route-path}/
   ├── page.tsx (Server Component by default)
   ├── loading.tsx (optional)
   ├── error.tsx (optional)
   ├── not-found.tsx (optional)
   └── components/
       ├── {page-name}-client.tsx (if client component needed)
       └── {page-name}-components.tsx (shared components)
   ```

3. **Generate Server Component (page.tsx)**
   - Use async/await for data fetching
   - Fetch data directly from database or API
   - Pass data as props to client components
   - Implement proper error handling
   - Add metadata/generateMetadata for SEO

4. **Generate Client Component (if needed)**
   - Add `'use client'` directive at top
   - Use React hooks (useState, useEffect, etc.)
   - Keep client boundary minimal
   - Use TanStack Query for interactive data fetching
   - Use Zustand for client state if needed

5. **Generate loading.tsx**
   - Create meaningful loading skeleton
   - Match the layout of the actual page

6. **Generate error.tsx**
   - Create error boundary component
   - Add reset functionality
   - Provide user-friendly error messages

7. **Generate API route (if needed)**
   ```
   apps/web/app/api/{route-path}/
   └── route.ts
   ```
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Return Response objects with proper status codes
   - Implement error handling
   - Add authentication/authorization

8. **Add internationalization**
   - Use `useTranslations` hook for client components
   - Use `getTranslations` for server components
   - Add translations to `locales/{locale}/common.json`

9. **Add TypeScript types**
   - Define proper types for props
   - Define types for API responses
   - Use shared types from `packages/shared-types`

## Code Style Requirements

- Server Components by default (no `'use client'`)
- Use `'use client'` only when necessary
- Push client boundaries down the tree
- Fetch data in Server Components
- Use TanStack Query in Client Components for interactive data
- Use Zustand for client-side state
- Follow Next.js 16 App Router conventions
- Implement proper error handling
- Add loading states
- Use proper TypeScript types

## Example Output Structure

```typescript
// page.tsx (Server Component)
export default async function PageName({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);
  
  return (
    <div>
      <PageNameClient data={data} />
    </div>
  );
}

// components/page-name-client.tsx (Client Component)
'use client';

export function PageNameClient({ data }: { data: DataType }) {
  const [state, setState] = useState();
  
  return <div>{/* Interactive UI */}</div>;
}
```
