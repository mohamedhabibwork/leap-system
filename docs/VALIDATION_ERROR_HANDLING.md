# Validation Error Handling Implementation

## Overview

This document describes the implementation of structured validation error handling across the backend and frontend of the LEAP PM system.

## Backend Implementation

### Error Response Format

All validation errors now return a structured format:

```json
{
  "statusCode": 400,
  "timestamp": "2026-01-10T...",
  "message": "Validation failed",
  "errors": {
    "email": ["Email must be a valid email address", "Email is required"],
    "password": ["Password must be at least 6 characters"],
    "profile.firstName": ["First name must be a string"]
  }
}
```

### Key Components

#### 1. ValidationExceptionFilter (`apps/backend/src/common/filters/validation-exception.filter.ts`)

Catches `BadRequestException` from NestJS ValidationPipe and transforms validation errors into the structured format. Features:
- Parses class-validator error messages
- Extracts field names from error messages
- Supports nested field paths (e.g., `profile.firstName`)
- Groups multiple errors per field

#### 2. HttpExceptionFilter (`apps/backend/src/common/filters/http-exception.filter.ts`)

Enhanced to detect and transform validation errors while maintaining backward compatibility for other error types.

#### 3. Global Configuration (`apps/backend/src/main.ts`)

Both filters are registered globally with proper ordering:
```typescript
app.useGlobalFilters(
  new ValidationExceptionFilter(),
  new HttpExceptionFilter(),
);
```

ValidationPipe configured to collect all errors:
```typescript
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  stopAtFirstError: false, // Collect all validation errors
  enableDebugMessages: true,
})
```

## Frontend Implementation

### Type Definitions

#### `apps/web/types/api-error.ts`

```typescript
interface ValidationError {
  statusCode: number;
  timestamp: string;
  message: string;
  errors: Record<string, string[]>;
}

interface ApiError {
  statusCode: number;
  timestamp: string;
  message: string;
  errors?: Record<string, string[]>;
}
```

### Utility Functions

#### `apps/web/lib/utils/validation-errors.ts`

Provides comprehensive error handling utilities:

- `extractValidationErrors(error)` - Extract validation errors from Axios errors
- `getFieldError(errors, field)` - Get first error for a field
- `getAllFieldErrors(errors, field)` - Get all errors for a field
- `mapErrorsToRHF(errors)` - Convert to React Hook Form format
- `hasValidationErrors(errors)` - Check if validation errors exist
- `getAllErrorMessages(errors)` - Get all error messages as array
- `formatValidationErrors(errors)` - Format for display
- `getValidationErrorCount(errors)` - Count total errors

### React Hooks

#### `apps/web/lib/hooks/use-validation-errors.ts`

Hook for handling validation errors in forms:

```typescript
const { setFormErrors, getError, getErrors, extractErrors } = useValidationErrors();

// Set errors on React Hook Form
setFormErrors(error, form.setError, {
  shouldFocus: true,
  rootErrorField: 'root.server'
});
```

#### `apps/web/lib/hooks/use-form-mutation.ts`

Enhanced TanStack Query mutation hook with automatic error handling:

```typescript
const mutation = useFormMutation({
  mutationFn: (data) => apiClient.post('/endpoint', data),
  form,
  autoSetFormErrors: true,
  onSuccess: () => { /* ... */ },
  onError: (error) => { /* custom handling */ },
});
```

### UI Components

#### `apps/web/components/ui/form.tsx`

Shadcn/ui form components with React Hook Form integration:
- `Form` - Form provider wrapper
- `FormField` - Field registration
- `FormItem` - Field container
- `FormLabel` - Field label
- `FormControl` - Input wrapper
- `FormMessage` - Error message display
- `FormDescription` - Help text

#### `apps/web/components/forms/form-validation-error.tsx`

Specialized error display components:

**FormValidationError** - Display errors for a single field:
```tsx
<FormValidationError 
  errors={errors.email} 
  fieldName="Email"
  showIcon={true}
/>
```

**ValidationErrorSummary** - Display all validation errors:
```tsx
<ValidationErrorSummary 
  errors={validationErrors}
  title="Please correct the following errors:"
/>
```

**InlineFieldError** - Minimal inline error display:
```tsx
<InlineFieldError error={error} />
```

### API Client Enhancement

#### `apps/web/lib/api/client.ts`

The Axios client response interceptor automatically attaches validation errors:

```typescript
error.validationErrors = error.response.data.errors;
```

This makes validation errors easily accessible throughout the application.

## Usage Examples

### Example 1: Basic Form with Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const mutation = useFormMutation({
    mutationFn: (data) => apiClient.post('/auth/login', data),
    form,
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
      </form>
    </Form>
  );
}
```

### Example 2: Manual Error Handling

```tsx
import { useValidationErrors } from '@/lib/hooks/use-validation-errors';

function MyComponent() {
  const { setFormErrors, extractErrors } = useValidationErrors();
  const form = useForm();

  const handleSubmit = async (data) => {
    try {
      await apiClient.post('/endpoint', data);
    } catch (error) {
      // Automatically set form errors
      setFormErrors(error, form.setError);
      
      // Or extract errors for custom handling
      const validationErrs = extractErrors(error);
      if (validationErrs) {
        console.log('Field errors:', validationErrs);
      }
    }
  };
}
```

### Example 3: Display All Errors

```tsx
import { ValidationErrorSummary } from '@/components/forms/form-validation-error';
import { extractValidationErrors } from '@/lib/utils/validation-errors';

function MyForm() {
  const [validationErrors, setValidationErrors] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => apiClient.post('/endpoint', data),
    onError: (error) => {
      const errors = extractValidationErrors(error);
      setValidationErrors(errors);
    },
  });

  return (
    <>
      {validationErrors && (
        <ValidationErrorSummary errors={validationErrors} />
      )}
      {/* Form fields... */}
    </>
  );
}
```

## Migration Guide

### For Existing Forms

1. **Install dependencies** (if not already installed):
   ```bash
   bun add react-hook-form @hookform/resolvers zod
   ```

2. **Convert to React Hook Form**:
   - Replace `useState` for form fields with `useForm`
   - Use `FormField` components instead of manual inputs
   - Add Zod schema for client-side validation

3. **Add validation error handling**:
   - Replace `useMutation` with `useFormMutation`
   - Remove manual error state management
   - Let the hook handle validation errors automatically

### For New Forms

1. Define Zod schema
2. Initialize form with `useForm`
3. Use `useFormMutation` for API calls
4. Use shadcn form components
5. Validation errors are handled automatically

## Best Practices

1. **Always use Zod schemas** for client-side validation
2. **Use `useFormMutation`** for automatic error handling
3. **Display `ValidationErrorSummary`** at the top of complex forms
4. **Use `FormMessage`** for individual field errors
5. **Provide clear, actionable error messages** in backend validators
6. **Handle nested fields** with dot notation (e.g., `profile.firstName`)
7. **Test validation** with both client-side and server-side scenarios

## Error Message Patterns

### Backend (class-validator)

The filter automatically parses these patterns:
- `"email must be an email"` → field: `email`
- `"password must be longer than 6 characters"` → field: `password`
- `"profile.firstName must be a string"` → field: `profile.firstName`

### Frontend Display

Errors are displayed in user-friendly format:
- Single error: Inline below field
- Multiple errors: Bullet list in alert
- Form-level errors: Summary at top

## Testing

### Backend Testing

Test DTOs to ensure proper validation error format:

```typescript
// Test validation error response
const response = await request(app.getHttpServer())
  .post('/auth/register')
  .send({ email: 'invalid', password: '123' })
  .expect(400);

expect(response.body).toMatchObject({
  statusCode: 400,
  message: 'Validation failed',
  errors: {
    email: expect.arrayContaining([expect.any(String)]),
    password: expect.arrayContaining([expect.any(String)]),
  },
});
```

### Frontend Testing

Test error extraction and form integration:

```typescript
import { extractValidationErrors } from '@/lib/utils/validation-errors';

it('extracts validation errors from API response', () => {
  const axiosError = {
    response: {
      data: {
        statusCode: 400,
        errors: {
          email: ['Email is required'],
        },
      },
    },
  };

  const errors = extractValidationErrors(axiosError);
  expect(errors).toEqual({
    email: ['Email is required'],
  });
});
```

## Troubleshooting

### Validation errors not showing

1. Check that filters are registered in `main.ts`
2. Verify DTO has class-validator decorators
3. Check ValidationPipe configuration
4. Ensure `stopAtFirstError: false` to collect all errors

### Nested field errors not working

1. Use dot notation in field names: `profile.firstName`
2. Ensure React Hook Form supports nested fields
3. Check that `mapErrorsToRHF` handles nested paths

### Frontend not receiving structured errors

1. Verify backend filters are registered
2. Check API client response interceptor
3. Ensure error response matches expected format
4. Check network tab for actual error response

## Future Enhancements

1. **Internationalization**: Support for multiple languages in error messages
2. **Custom validators**: Add project-specific validation decorators
3. **Error analytics**: Track common validation errors
4. **Improved DX**: Better TypeScript inference for field paths
5. **Accessibility**: Enhanced ARIA labels for error messages

## References

- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [class-validator](https://github.com/typestack/class-validator)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
