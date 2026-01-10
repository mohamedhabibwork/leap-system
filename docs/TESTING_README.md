# Testing Guide

## Overview

This document outlines the testing strategy and provides guidelines for writing and running tests in the LMS platform.

## Test Structure

### Backend Tests (`apps/backend/test/`)

```
test/
├── api/              # API endpoint tests
│   ├── courses.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   └── ...
├── security/         # Security and authorization tests
│   ├── rbac.e2e-spec.ts
│   ├── ownership.e2e-spec.ts
│   └── ...
├── integration/      # Integration tests
└── unit/            # Unit tests
```

### Frontend Tests (`apps/web/app/__tests__/`)

```
__tests__/
├── components/      # Component tests
│   ├── theme-toggle.test.tsx
│   ├── file-upload.test.tsx
│   └── ...
├── hooks/          # Hook tests
│   ├── use-admin-api.test.tsx
│   ├── use-instructor-api.test.tsx
│   └── ...
├── pages/          # Page tests
└── utils/          # Utility function tests
```

## Running Tests

### Backend Tests

```bash
# Run all tests
cd apps/backend
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch

# Run specific test file
npm test -- courses.e2e-spec.ts
```

### Frontend Tests

```bash
# Run all tests
cd apps/web
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test file
npm test -- theme-toggle.test.tsx
```

## Writing Tests

### Backend E2E Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feature (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should do something', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/resource')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

### Frontend Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  const queryClient = new QueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render correctly', () => {
    render(<MyComponent />, { wrapper });
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<MyComponent />, { wrapper });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(await screen.findByText('Result')).toBeInTheDocument();
  });
});
```

### Frontend Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from './useMyHook';
import apiClient from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('useMyHook', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (apiClient.get as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMyHook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});
```

## Testing Guidelines

### General Principles

1. **Write Clear Test Names**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
4. **Keep Tests Independent**: Each test should run independently of others
5. **Use Meaningful Assertions**: Assert the actual behavior, not intermediate states

### Security Testing

Always test:

- ✅ Authentication is required
- ✅ Authorization based on roles
- ✅ Resource ownership validation
- ✅ Super admin bypass works correctly
- ✅ Data isolation between users
- ✅ No unauthorized data leakage

Example:

```typescript
describe('Security', () => {
  it('should deny access without authentication', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/protected')
      .expect(401);
  });

  it('should deny access without proper role', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/endpoint')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  it('should deny access to other users data', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/999/private-data')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

### API Testing

Test all CRUD operations:

```typescript
describe('Resource API', () => {
  it('should list resources', () => { /* ... */ });
  it('should get single resource', () => { /* ... */ });
  it('should create resource', () => { /* ... */ });
  it('should update resource', () => { /* ... */ });
  it('should delete resource', () => { /* ... */ });
  it('should handle validation errors', () => { /* ... */ });
  it('should handle not found', () => { /* ... */ });
});
```

### Component Testing

Test all user interactions:

```typescript
describe('Component', () => {
  it('should render with initial state', () => { /* ... */ });
  it('should handle button click', () => { /* ... */ });
  it('should display loading state', () => { /* ... */ });
  it('should display error state', () => { /* ... */ });
  it('should display empty state', () => { /* ... */ });
  it('should validate form input', () => { /* ... */ });
});
```

## Test Coverage Goals

- **Backend**: Aim for >80% code coverage
- **Frontend**: Aim for >70% code coverage
- **Critical Paths**: 100% coverage for authentication, authorization, and payment flows

## Continuous Integration

Tests run automatically on:

- Every pull request
- Before merging to main
- Scheduled nightly runs

CI will fail if:

- Any test fails
- Code coverage drops below threshold
- Security tests fail

## Common Issues and Solutions

### Issue: Tests timeout

**Solution**: Increase timeout in jest config:

```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000, // 30 seconds
};
```

### Issue: Database conflicts in E2E tests

**Solution**: Use transactions and rollback:

```typescript
beforeEach(async () => {
  await queryRunner.startTransaction();
});

afterEach(async () => {
  await queryRunner.rollbackTransaction();
});
```

### Issue: Mock API calls not working

**Solution**: Ensure mocks are cleared between tests:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
