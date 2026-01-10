# Validation Error Handling - Quick Start Guide

## Backend: Creating Validated Endpoints

### Step 1: Create a DTO with validation decorators

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  password: string;
}
```

### Step 2: Use the DTO in your controller

```typescript
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}
```

That's it! Validation errors will automatically be formatted as:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["email must be an email"],
    "password": ["password must be longer than or equal to 6 characters"]
  }
}
```

## Frontend: Creating Validated Forms

### Step 1: Define your schema with Zod

```typescript
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;
```

### Step 2: Set up the form with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<FormData>({
  resolver: zodResolver(formSchema) as any,
  defaultValues: { email: '', password: '' },
});
```

### Step 3: Use useFormMutation for automatic error handling

```typescript
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import apiClient from '@/lib/api/client';

const mutation = useFormMutation({
  mutationFn: (data: FormData) => apiClient.post('/auth/register', data),
  form,
  onSuccess: () => {
    toast.success('Registration successful!');
    router.push('/dashboard');
  },
});
```

### Step 4: Build your form with shadcn components

```tsx
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

<Form {...form}>
  <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="you@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="••••••••" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <Button type="submit" disabled={mutation.isPending}>
      {mutation.isPending ? 'Submitting...' : 'Submit'}
    </Button>
  </form>
</Form>
```

That's it! The form will:
- ✅ Validate on the client-side with Zod
- ✅ Validate on the server-side with class-validator
- ✅ Automatically display server validation errors
- ✅ Focus the first field with an error
- ✅ Show loading state during submission

## Optional: Display Error Summary

Add this at the top of your form to show all validation errors:

```tsx
import { ValidationErrorSummary } from '@/components/forms/form-validation-error';
import { extractValidationErrors } from '@/lib/utils/validation-errors';
import { useState } from 'react';

const [validationErrors, setValidationErrors] = useState(null);

const mutation = useFormMutation({
  mutationFn: (data) => apiClient.post('/endpoint', data),
  form,
  onError: (error) => {
    const errors = extractValidationErrors(error);
    setValidationErrors(errors);
  },
});

// In your JSX:
{validationErrors && (
  <ValidationErrorSummary errors={validationErrors} />
)}
```

## Common Patterns

### Nested Objects

**Backend:**
```typescript
class ProfileDto {
  @IsString()
  firstName: string;
  
  @IsString()
  lastName: string;
}

class UpdateUserDto {
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}
```

**Frontend:**
```typescript
const schema = z.object({
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
});

// Errors will be mapped to: profile.firstName, profile.lastName
```

### Custom Error Messages

**Backend:**
```typescript
@IsEmail({}, { message: 'Please provide a valid email address' })
email: string;

@MinLength(6, { message: 'Password is too short (minimum 6 characters)' })
password: string;
```

### Multiple Errors Per Field

The system automatically collects all errors for each field:

```json
{
  "errors": {
    "password": [
      "password must be longer than or equal to 6 characters",
      "password must contain at least one uppercase letter",
      "password must contain at least one number"
    ]
  }
}
```

## Manual Error Handling (Advanced)

If you need custom error handling without automatic form integration:

```typescript
import { useValidationErrors } from '@/lib/hooks/use-validation-errors';

const { setFormErrors, extractErrors } = useValidationErrors();

try {
  await apiClient.post('/endpoint', data);
} catch (error) {
  // Option 1: Set errors on form
  setFormErrors(error, form.setError);
  
  // Option 2: Extract for custom handling
  const validationErrors = extractErrors(error);
  if (validationErrors) {
    // Do something with errors
    Object.entries(validationErrors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(', ')}`);
    });
  }
}
```

## Utility Functions Reference

```typescript
import {
  extractValidationErrors,
  getFieldError,
  getAllFieldErrors,
  hasValidationErrors,
  getAllErrorMessages,
  formatValidationErrors,
  getValidationErrorCount,
} from '@/lib/utils/validation-errors';

// Extract from Axios error
const errors = extractValidationErrors(error);

// Get first error for a field
const emailError = getFieldError(errors, 'email');

// Get all errors for a field
const passwordErrors = getAllFieldErrors(errors, 'password');

// Check if any errors exist
if (hasValidationErrors(errors)) {
  // Handle errors
}

// Get all error messages as array
const allMessages = getAllErrorMessages(errors);

// Format for display
const formatted = formatValidationErrors(errors, '\n');

// Count total errors
const count = getValidationErrorCount(errors);
```

## See Also

- [Full Documentation](./VALIDATION_ERROR_HANDLING.md)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
