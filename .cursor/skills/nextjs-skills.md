# Next.js Skills

Specialized capabilities for working with Next.js 16 App Router frontend development.

## Server Components (Default)

### Data Fetching
- Fetch data directly in Server Components
- Use async/await for data fetching
- Access databases and APIs directly
- No need for API routes for simple data fetching

### Patterns
```typescript
// Server Component with data fetching
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);
  return <div>{data.title}</div>;
}
```

## Client Components

### When to Use
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- Third-party libraries requiring browser APIs

### Patterns
```typescript
'use client';

export function InteractiveComponent() {
  const [state, setState] = useState();
  
  return (
    <button onClick={() => setState('clicked')}>
      Click me
    </button>
  );
}
```

## Data Fetching Patterns

### Server Components
- Fetch data directly with async/await
- Use fetch with Next.js caching
- Access databases directly
- Use Server Actions for mutations

### Client Components
- Use TanStack Query for interactive data
- Use Zustand for client state
- Fetch on user interaction
- Implement optimistic updates

### TanStack Query Integration
```typescript
'use client';

export function DataComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['resource'],
    queryFn: () => fetchResource(),
  });
  
  if (isLoading) return <Loading />;
  return <div>{data.title}</div>;
}
```

## Routing

### App Router Structure
```
app/
├── [locale]/          # Internationalization
│   ├── (hub)/         # Route group
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── api/               # API routes
│   └── route.ts
└── layout.tsx         # Root layout
```

### Dynamic Routes
- `[id]` - Single dynamic segment
- `[...slug]` - Catch-all routes
- `[[...slug]]` - Optional catch-all

### Route Groups
- `(folder)` - Organize without affecting URL
- Use for layouts and organization

## Server Actions

### Form Handling
```typescript
// Server Action
async function createResource(formData: FormData) {
  'use server';
  
  const data = {
    name: formData.get('name'),
  };
  
  await db.resource.create({ data });
  revalidatePath('/resources');
}
```

### Usage
```typescript
// In Server Component
export default function Form() {
  return (
    <form action={createResource}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## State Management

### Server State
- Use TanStack Query exclusively
- Automatic caching and refetching
- Optimistic updates
- Cache invalidation

### Client State
- Use Zustand for UI state
- Use React Context for theme/locale
- Use URL state for filters/search
- Keep state minimal

## Internationalization

### Server Components
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('title')}</h1>;
}
```

### Client Components
```typescript
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}
```

## Performance Optimization

### Image Optimization
- Use `next/image` for all images
- Provide width and height
- Use `priority` for above-the-fold
- Use `placeholder="blur"` for better UX

### Code Splitting
- Use dynamic imports
- Lazy load heavy components
- Split vendor bundles

### Caching
- Use Next.js fetch caching
- Implement ISR for static content
- Use revalidatePath/revalidateTag

## Error Handling

### Error Boundaries
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading States
```typescript
export default function Loading() {
  return <Skeleton />;
}
```

## SEO

### Metadata
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchData(params.id);
  
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      images: [data.image],
    },
  };
}
```

## Best Practices

1. **Server Components by default** - Only use 'use client' when needed
2. **Push client boundaries down** - Keep client components small
3. **Fetch data in Server Components** - Use TanStack Query in Client Components
4. **Use proper TypeScript types** - No `any` types
5. **Implement error handling** - Use error.tsx and error boundaries
6. **Add loading states** - Use loading.tsx and Suspense
7. **Optimize images** - Use next/image
8. **Implement SEO** - Use metadata and generateMetadata
9. **Use Server Actions** - For form submissions and mutations
10. **Follow App Router conventions** - Use file-based routing
