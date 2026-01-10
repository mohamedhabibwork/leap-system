# Quick Reference Cheatsheet

A quick reference guide for common patterns and decisions in the LeapV2 project.

---

## 🎯 State Management Quick Decisions

### When to Use What?

```
Data from API/Database? → TanStack Query
UI State (modals, tabs)? → Zustand
Form State? → React Hook Form + Zustand (if multi-step)
URL Parameters? → Next.js useSearchParams/usePathname
Local Component State? → useState
```

### TanStack Query Snippets

```typescript
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  staleTime: 5 * 60 * 1000,
});

// Mutation
const { mutate, isPending } = useMutation({
  mutationFn: (data) => createResource(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  },
});

// Optimistic Update
const { mutate } = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous);
  },
});
```

### Zustand Store Template

```typescript
interface Store {
  // State
  items: Item[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Item) => void;
  toggle: () => void;
  reset: () => void;
}

export const useStore = create<Store>((set) => ({
  items: [],
  isOpen: false,
  
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  reset: () => set({ items: [], isOpen: false }),
}));
```

---

## 🏗️ Component Type Decisions

### Server vs Client Component

```typescript
// ✅ Server Component (Default)
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}

// ✅ Client Component (When needed)
'use client';
export function Interactive() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>Click</button>;
}
```

### When to Use Client Components

```
✅ useState, useEffect, useContext
✅ Event handlers (onClick, onChange)
✅ Browser APIs (localStorage, window)
✅ Third-party libraries (Zustand, React Hook Form)
✅ Real-time (WebSocket, Socket.io)

❌ Data fetching (use Server Component + TanStack Query)
❌ Static content
❌ SEO-critical content
```

---

## 🎨 Common Component Patterns

### Basic Component

```typescript
interface Props {
  title: string;
  description?: string;
  onAction?: () => void;
  className?: string;
}

export function Component({ 
  title, 
  description, 
  onAction,
  className 
}: Props) {
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && <Button onClick={onAction}>Action</Button>}
    </div>
  );
}
```

### Polymorphic Component

```typescript
type ButtonProps<C extends React.ElementType = 'button'> = {
  as?: C;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<C>, 'as'>;

export function Button<C extends React.ElementType = 'button'>({
  as,
  children,
  ...props
}: ButtonProps<C>) {
  const Component = as || 'button';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Button>Regular</Button>
<Button as="a" href="/link">Link</Button>
<Button as={Link} to="/route">Router Link</Button>
```

### Compound Component

```typescript
export function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = ({ children }) => (
  <div className="card-header">{children}</div>
);

Card.Body = ({ children }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

---

## 🎨 Styling Patterns

### Conditional Classes

```typescript
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes',
  className
)} />
```

### Variant Pattern (CVA)

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'base-button-classes',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        secondary: 'bg-secondary',
        outline: 'border border-input',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  );
}
```

### Responsive Design

```typescript
<div className="
  w-full md:w-1/2 lg:w-1/3
  p-4 md:p-6 lg:p-8
  text-sm md:text-base lg:text-lg
" />
```

---

## 🖼️ Image Optimization

### Basic Image

```typescript
<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### Responsive Image (Fill)

```typescript
<div className="relative aspect-video">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
  />
</div>
```

### With Priority (Above Fold)

```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

---

## 🔧 Custom Hooks Patterns

### Data Fetching Hook

```typescript
export const useResource = (id: string) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResource(id),
    staleTime: 5 * 60 * 1000,
  });
};
```

### Mutation Hook

```typescript
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDto) => createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

### UI State Hook

```typescript
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
};
```

---

## 🏛️ Backend Patterns

### Controller (Thin)

```typescript
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  
  @Post()
  async create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }
}
```

### Service (Business Logic)

```typescript
@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly notificationService: NotificationService,
  ) {}
  
  async create(dto: CreateCourseDto): Promise<Course> {
    const course = await this.courseRepo.create(dto);
    await this.notificationService.notifyCourseCreated(course);
    return course;
  }
}
```

### Repository (Data Access)

```typescript
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findById(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id } });
  }
  
  async create(data: CreateCourseDto): Promise<Course> {
    return this.prisma.course.create({ data });
  }
}
```

### DTO with Validation

```typescript
export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;
  
  @IsString()
  @MaxLength(500)
  description: string;
  
  @IsNumber()
  @Min(0)
  price: number;
  
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus = CourseStatus.DRAFT;
}
```

---

## 🧪 Testing Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Service Test

```typescript
describe('CourseService', () => {
  let service: CourseService;
  let repository: jest.Mocked<CourseRepository>;
  
  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    
    service = new CourseService(repository);
  });
  
  it('creates course', async () => {
    const dto = { title: 'Test' };
    const expected = { id: '1', ...dto };
    
    repository.create.mockResolvedValue(expected);
    
    const result = await service.create(dto);
    
    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });
});
```

---

## 📝 TypeScript Patterns

### Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}
```

### Discriminated Union

```typescript
type State<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: State<T>) {
  switch (state.status) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    case 'success': return state.data;
    case 'error': return state.error.message;
  }
}
```

### Generic Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## ⚡ Performance Patterns

### Memoization

```typescript
// Memoize expensive computation
const sorted = useMemo(() => 
  data.sort((a, b) => b.date - a.date),
  [data]
);

// Memoize callback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize component
const Item = memo(({ item }) => <div>{item.name}</div>);
```

### Code Splitting

```typescript
// Dynamic import
const Heavy = dynamic(() => import('./heavy'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Lazy load
const LazyComponent = lazy(() => import('./component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

---

## 🔒 Common Patterns

### Error Handling

```typescript
// Frontend
try {
  await mutate(data);
} catch (error) {
  console.error(error);
  toast.error('Failed to save');
}

// Backend
try {
  return await this.service.create(dto);
} catch (error) {
  this.logger.error('Failed to create', error.stack);
  throw new InternalServerErrorException('Failed to create resource');
}
```

### Loading States

```typescript
// With TanStack Query
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (error) return <Error />;
return <Data data={data} />;

// With Suspense
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### Form Handling

```typescript
// Simple form
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);
  await mutate(data);
};

// With React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  await mutate(data);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('name', { required: true })} />
  {errors.name && <span>Required</span>}
</form>
```

---

## 📦 File Structure Quick Reference

```
Frontend:
  components/
    [feature]/
      component-name.tsx
      component-name.types.ts
      index.ts
  lib/
    hooks/
      use-[resource].ts
    utils/
      [util-name].ts
    api/
      [resource]-api.ts
  app/
    (group)/
      [route]/
        page.tsx
        loading.tsx
        error.tsx

Backend:
  modules/
    [resource]/
      [resource].controller.ts
      [resource].service.ts
      [resource].module.ts
      [resource].repository.ts
      dto/
        create-[resource].dto.ts
        update-[resource].dto.ts
```

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Backend
npm run start:dev       # Start NestJS dev
npm run test           # Run tests
npm run test:watch     # Watch mode

# Code Quality
npm run lint           # Lint code
npm run format         # Format code
npm run type-check     # Check types

# Database
npx prisma migrate dev # Run migrations
npx prisma studio      # Open Prisma Studio
npx prisma generate    # Generate client
```

---

## 💡 Quick Tips

1. **Always use TypeScript** - No `any`, use `unknown` instead
2. **Server Components by default** - Only use `'use client'` when necessary
3. **TanStack Query for server data** - Never in Zustand
4. **Keep components small** - < 200 lines
5. **Keep functions focused** - < 20 lines
6. **Use Suspense** - For loading states
7. **Use next/image** - For all images
8. **Cache strategically** - Use appropriate staleTime
9. **Test critical paths** - Aim for 80% coverage
10. **Follow SOLID** - Single responsibility, focused modules

---

## 🔗 Quick Links

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Keep this handy for quick reference during development!**
