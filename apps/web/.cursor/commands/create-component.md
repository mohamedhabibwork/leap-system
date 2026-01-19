# Create Component

Create a React component following clean code principles and Next.js best practices.

## Steps

1. **Determine Component Type**
   - Server Component (default)
   - Client Component (if interactivity needed)
   - Hybrid (Server wrapper + Client children)

2. **Create Component Structure**
   ```
   components/{feature-name}/
   ├── {component-name}.tsx
   ├── {component-name}-client.tsx (if needed)
   ├── {component-name}-skeleton.tsx (if needed)
   ├── use-{component-name}.ts (if needed)
   └── index.ts
   ```

3. **Define Types**
   - Create prop interface
   - Use TypeScript strictly
   - Export types
   - Use shared types when available

4. **Implement Component**
   - Keep component focused
   - Extract logic to hooks
   - Use composition
   - Handle errors properly

5. **Add Internationalization**
   - Use useTranslations/getTranslations
   - Add translation keys
   - Support EN/AR

6. **Add Tests**
   - Component tests
   - Hook tests (if applicable)
   - Accessibility tests

## Code Template

```typescript
// Server Component
interface ComponentProps {
  data: DataType;
}

export default async function Component({ data }: ComponentProps) {
  return (
    <div>
      <ComponentClient data={data} />
    </div>
  );
}

// Client Component
'use client';

interface ComponentClientProps {
  data: DataType;
}

export function ComponentClient({ data }: ComponentClientProps) {
  const { state, setState } = useComponentState();
  
  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

## Clean Code Requirements

- Single responsibility
- Small and focused
- Clear prop types
- Proper error handling
- Performance optimized
- Accessible
- Internationalized
- Tested
