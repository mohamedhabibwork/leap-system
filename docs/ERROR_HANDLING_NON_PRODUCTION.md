# Error Handling in Non-Production Environments

## Overview

The validation error handling system now includes enhanced error details in non-production environments (development, staging, etc.) while keeping production secure and user-friendly.

---

## Backend Error Details

### What's Included in Non-Production

When `NODE_ENV !== 'production'`, all error responses include:

1. **Stack Trace** - Full error stack for debugging
2. **Error Name** - The error class name (e.g., `BadRequestException`)
3. **Detailed Message** - Additional context about the error

### Example Error Response (Development)

```json
{
  "statusCode": 500,
  "timestamp": "2026-01-10T12:34:56.789Z",
  "message": "Internal server error",
  "stack": "Error: Database connection failed\n    at DatabaseService.connect (/app/src/database/service.ts:45:11)\n    at async AuthController.login (/app/src/auth/controller.ts:23:5)",
  "name": "InternalServerErrorException",
  "details": "Database connection failed"
}
```

### Example Error Response (Production)

```json
{
  "statusCode": 500,
  "timestamp": "2026-01-10T12:34:56.789Z",
  "message": "Internal server error"
}
```

---

## Frontend Error Handling

### Console Logging (Non-Production Only)

All API errors are automatically logged to the console in development with:

- HTTP Status Code
- Error Message
- Request URL and Method
- Stack Trace (if available)
- Validation Errors (if applicable)
- Full Error Object

### Example Console Output

```
🔴 API Error
Status: 400
Message: Validation failed
URL: /api/v1/auth/login
Method: POST
Validation Errors: { email: ["email must be an email"], password: ["password must be longer than 6 characters"] }
Full Error: { statusCode: 400, timestamp: "...", ... }
```

### Error Display Components

#### ErrorDetails Component

Use this component to display detailed error information in development:

```tsx
import { ErrorDetails } from '@/components/errors/error-details';

function MyComponent() {
  const [error, setError] = useState(null);

  return (
    <>
      {error && (
        <ErrorDetails 
          error={error}
          title="Login Failed"
          showStack={true}
        />
      )}
    </>
  );
}
```

**Features:**
- Shows error message, status code, and error type
- Displays additional details if available
- Includes collapsible stack trace
- Automatically hides sensitive info in production
- Shows a note that details are only in development

#### SimpleErrorDisplay Component

For production-safe error display:

```tsx
import { SimpleErrorDisplay } from '@/components/errors/error-details';

<SimpleErrorDisplay message="Login failed. Please try again." />
```

### useErrorMessage Hook

Automatically formats error messages based on environment:

```tsx
import { useErrorMessage } from '@/components/errors/error-details';

function MyForm() {
  const [error, setError] = useState(null);
  const errorMessage = useErrorMessage(error);

  // In development: "[400] Validation failed (Email is invalid)"
  // In production: "Validation failed"
  
  return <div>{errorMessage}</div>;
}
```

---

## Enhanced Hook Error Messages

### useValidationErrors Hook

The hook now includes detailed error information in non-production:

```tsx
const { setFormErrors } = useValidationErrors();

// Development error: "[400] Invalid credentials (User not found)"
// Production error: "Invalid credentials"
```

### useFormMutation Hook

Automatically enhanced error messages in development:

```tsx
const mutation = useFormMutation({
  mutationFn: (data) => apiClient.post('/endpoint', data),
  form,
  onError: (error) => {
    // Error already includes details in development
    console.log(error); // Full details logged automatically
  },
});
```

---

## Login Form Example

The login form now shows enhanced errors in development:

```tsx
// Development
"[401] Invalid email or password (Details: User with email admin@test.com not found)"

// Production
"Invalid email or password"
```

---

## Configuration

### Environment Variables

Make sure these are set correctly:

**Development:**
```bash
NODE_ENV=development
```

**Production:**
```bash
NODE_ENV=production
```

### Next.js Configuration

The frontend automatically uses `process.env.NODE_ENV` which is set by Next.js:

- `next dev` → `NODE_ENV=development`
- `next build && next start` → `NODE_ENV=production`

---

## Best Practices

### 1. Never Log Sensitive Data

Even in development, avoid logging:
- Passwords or tokens
- Personal identification information
- Credit card numbers
- API keys

### 2. Use Appropriate Error Messages

**Do:**
```typescript
// Development-friendly, production-safe
throw new BadRequestException('Invalid email format');
```

**Don't:**
```typescript
// Exposes internal details
throw new Error(`User ${userId} not found in database table users_v2`);
```

### 3. Structured Logging

Use proper logging in backend:

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('AuthService');

try {
  // operation
} catch (error) {
  logger.error('Login failed', error.stack);
  throw new BadRequestException('Invalid credentials');
}
```

### 4. Error Boundaries

Wrap your components with error boundaries:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorDetails } from '@/components/errors/error-details';

<ErrorBoundary
  FallbackComponent={({ error }) => (
    <ErrorDetails 
      error={error}
      title="Something went wrong"
    />
  )}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Testing Error Handling

### Test in Development

1. **Start backend in development:**
   ```bash
   cd apps/backend
   NODE_ENV=development bun run dev
   ```

2. **Start frontend in development:**
   ```bash
   cd apps/web
   bun run dev
   ```

3. **Trigger an error:**
   - Submit invalid form data
   - Make an unauthorized request
   - Cause a server error

4. **Check console output:**
   - Should see detailed error logs
   - Should see stack traces
   - Should see full error objects

### Test in Production Mode

1. **Build and start backend:**
   ```bash
   cd apps/backend
   NODE_ENV=production bun run build
   NODE_ENV=production bun run start
   ```

2. **Build and start frontend:**
   ```bash
   cd apps/web
   bun run build
   NODE_ENV=production bun run start
   ```

3. **Trigger the same errors:**
   - Should NOT see stack traces
   - Should NOT see detailed logs
   - Should see user-friendly messages only

---

## Security Considerations

### What's Hidden in Production

✅ Stack traces  
✅ Internal error names  
✅ Database query details  
✅ File paths  
✅ Environment variables  
✅ Internal service details  

### What's Still Shown

✅ User-friendly error messages  
✅ Validation errors (field-level)  
✅ HTTP status codes  
✅ General error categories  

---

## Examples

### Backend Exception with Details

```typescript
// auth.service.ts
async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
    // Production: "Invalid credentials"
    // Development: Includes stack trace and error details
  }
  
  if (!await bcrypt.compare(password, user.password)) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  return this.generateTokens(user);
}
```

### Frontend Error Display

```tsx
import { ErrorDetails, SimpleErrorDisplay } from '@/components/errors/error-details';

function LoginForm() {
  const [error, setError] = useState(null);

  return (
    <form onSubmit={handleSubmit}>
      {/* Production-safe display */}
      {error && process.env.NODE_ENV === 'production' && (
        <SimpleErrorDisplay message="Login failed. Please try again." />
      )}
      
      {/* Development-detailed display */}
      {error && process.env.NODE_ENV !== 'production' && (
        <ErrorDetails 
          error={error}
          title="Login Error"
          showStack={true}
        />
      )}
      
      {/* Form fields... */}
    </form>
  );
}
```

---

## Summary

✅ **Development**: Full error details, stack traces, and debugging information  
✅ **Production**: Clean, user-friendly error messages without sensitive details  
✅ **Automatic**: No configuration needed, uses `NODE_ENV`  
✅ **Secure**: Sensitive information never leaked to production users  
✅ **Developer-Friendly**: Easy to debug issues in development  

---

## Related Documentation

- [Validation Error Handling](./VALIDATION_ERROR_HANDLING.md)
- [Quick Start Guide](./VALIDATION_QUICK_START.md)
- [Implementation Summary](../VALIDATION_IMPLEMENTATION_SUMMARY.md)
