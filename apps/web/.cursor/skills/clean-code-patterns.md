# Clean Code Patterns for Next.js

Specialized clean code patterns and techniques for Next.js frontend development.

## Component Patterns

### Container/Presenter Pattern
```typescript
// Container (Server Component)
export default async function CourseListContainer() {
  const courses = await fetchCourses();
  return <CourseListPresenter courses={courses} />;
}

// Presenter (Client Component)
'use client';

export function CourseListPresenter({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => 
    courses.filter(c => c.title.includes(filter)),
    [courses, filter]
  );
  
  return (
    <div>
      <FilterInput value={filter} onChange={setFilter} />
      <CourseGrid courses={filtered} />
    </div>
  );
}
```

### Compound Components
```typescript
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

## Hook Patterns

### Custom Data Fetching Hook
```typescript
export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourse(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Composed Hooks
```typescript
export function useCourseWithEnrollment(courseId: string) {
  const course = useCourse(courseId);
  const enrollment = useEnrollment(courseId);
  
  return {
    course: course.data,
    isEnrolled: !!enrollment.data,
    isLoading: course.isLoading || enrollment.isLoading,
  };
}
```

### State Management Hook
```typescript
export function useFormState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);
  
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  return { state, updateField, errors, setFieldError };
}
```

## Data Fetching Patterns

### Server Component Data Fetching
```typescript
export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = await fetchCourse(params.id);
  
  if (!course) {
    notFound();
  }
  
  return <CourseDetails course={course} />;
}
```

### Parallel Data Fetching
```typescript
export default async function Dashboard() {
  const [user, courses, stats] = await Promise.all([
    fetchUser(),
    fetchCourses(),
    fetchStats(),
  ]);
  
  return (
    <div>
      <UserHeader user={user} />
      <CourseList courses={courses} />
      <StatsWidget stats={stats} />
    </div>
  );
}
```

### Streaming with Suspense
```typescript
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<CoursesSkeleton />}>
        <CourseList />
      </Suspense>
    </div>
  );
}
```

## Error Handling Patterns

### Error Boundary Pattern
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Error:', error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Error Handling in Hooks
```typescript
export function useCourse(courseId: string) {
  const query = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourse(courseId),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (query.error) {
    // Handle error appropriately
    console.error('Failed to fetch course:', query.error);
  }

  return query;
}
```

## Performance Patterns

### Code Splitting
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <ComponentSkeleton />,
  ssr: false, // If component doesn't need SSR
});
```

### Memoization Pattern
```typescript
export const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data 
}: { 
  data: DataType 
}) {
  const processed = useMemo(() => 
    expensiveCalculation(data),
    [data]
  );
  
  return <div>{processed}</div>;
}, (prev, next) => prev.data.id === next.data.id);
```

### Virtual Scrolling for Large Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div key={virtualItem.key} style={{ height: `${virtualItem.size}px` }}>
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## State Management Patterns

### Server State (TanStack Query)
```typescript
export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => fetchCourses(filters),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Client State (Zustand)
```typescript
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### URL State
```typescript
export function useSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);
  
  return { searchParams, updateParam };
}
```

## Testing Patterns

### Component Testing
```typescript
describe('CourseCard', () => {
  it('should render course information', () => {
    const course = { id: '1', title: 'Test Course' };
    render(<CourseCard course={course} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
describe('useCourse', () => {
  it('should fetch course data', async () => {
    const { result } = renderHook(() => useCourse('1'));
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('1');
  });
});
```
