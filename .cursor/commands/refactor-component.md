# Refactor Component

Refactor a React component to follow best practices, improve maintainability, and optimize performance.

## Steps

1. **Analyze Current Component**
   - Identify issues:
     - Too large (should be < 300 lines)
     - Multiple responsibilities
     - Poor performance (unnecessary re-renders)
     - Hard to test
     - Duplicated logic
     - Poor TypeScript types

2. **Plan Refactoring**
   - Break into smaller components
   - Extract custom hooks
   - Extract utility functions
   - Improve TypeScript types
   - Optimize performance

3. **Extract Subcomponents**
   - Identify reusable parts
   - Create focused subcomponents
   - Use proper prop types
   - Co-locate related components

4. **Extract Custom Hooks**
   - Extract state logic
   - Extract data fetching logic
   - Extract event handlers
   - Create reusable hooks

5. **Extract Utilities**
   - Extract pure functions
   - Extract formatters
   - Extract validators
   - Extract constants

6. **Improve TypeScript**
   - Add proper types for props
   - Use interfaces for complex types
   - Remove `any` types
   - Use generics where appropriate

7. **Optimize Performance**
   - Use React.memo for expensive components
   - Use useMemo for expensive calculations
   - Use useCallback for event handlers
   - Lazy load heavy components
   - Optimize re-renders

8. **Improve Code Organization**
   - Group related code
   - Use consistent naming
   - Add meaningful comments
   - Follow project structure

9. **Update Tests**
   - Update existing tests
   - Add tests for new components/hooks
   - Ensure all tests pass

10. **Verify Functionality**
    - Test all features still work
    - Check for regressions
    - Verify performance improvements

## Refactoring Patterns

### Extract Subcomponent
```typescript
// Before: Large component
export function UserProfile({ user }: Props) {
  return (
    <div>
      {/* 100+ lines of JSX */}
    </div>
  );
}

// After: Extracted subcomponents
export function UserProfile({ user }: Props) {
  return (
    <div>
      <UserHeader user={user} />
      <UserDetails user={user} />
      <UserActions user={user} />
    </div>
  );
}
```

### Extract Custom Hook
```typescript
// Before: Logic in component
export function Component() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Complex data fetching logic
  }, []);
  
  // Component JSX
}

// After: Extracted hook
function useComponentData() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Complex data fetching logic
  }, []);
  
  return { data, loading };
}

export function Component() {
  const { data, loading } = useComponentData();
  // Component JSX
}
```

## Requirements

- Maintain functionality
- Improve code quality
- Follow project conventions
- Add/update tests
- Document changes
- Verify no regressions
