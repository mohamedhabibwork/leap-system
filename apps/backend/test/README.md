# Test Suite with Faker

This directory contains comprehensive test cases using `@faker-js/faker` to generate realistic test data and ensure all GET endpoints return data without errors.

## Structure

```
test/
├── factories/              # Faker-based data factories
│   ├── user.factory.ts
│   ├── course.factory.ts
│   ├── event.factory.ts
│   ├── job.factory.ts
│   ├── social.factory.ts
│   ├── media.factory.ts
│   ├── subscription.factory.ts
│   ├── ticket.factory.ts
│   ├── comment.factory.ts
│   ├── notification.factory.ts
│   └── index.ts
├── utils/                  # Test utilities
│   ├── test-db.helper.ts   # Database test utilities
│   └── test-auth.helper.ts # Auth test utilities
├── e2e/                    # End-to-end tests
│   ├── get-endpoints.e2e-spec.ts
│   └── data-validation.e2e-spec.ts
└── integration/            # Integration tests
    ├── services/
    └── controllers/
```

## Usage

### Running Tests

```bash
# Run all faker-based tests
npm run test:faker

# Run only E2E tests
npm run test:faker:e2e

# Run only integration tests
npm run test:faker:integration

# Run tests in watch mode
npm run test:faker:watch
```

### From Root Directory

```bash
# Run faker tests from monorepo root
npm run test:faker
```

## Test Commands

- `test:faker` - Run all faker-based tests (E2E + integration)
- `test:faker:e2e` - Run E2E tests with faker data
- `test:faker:integration` - Run integration tests with faker data
- `test:faker:watch` - Watch mode for faker tests

## Factories

All factories are located in `test/factories/` and can be imported from the index:

```typescript
import {
  createUserFactory,
  createCourseFactory,
  createEventFactory,
  // ... etc
} from '../factories';
```

### Example Usage

```typescript
import { createUserFactory } from '../factories/user.factory';

// Create a single user
const userData = createUserFactory();

// Create a user with overrides
const adminUser = createUserFactory({ 
  email: 'admin@test.com',
  roleId: 1 
});

// Create multiple users
const users = createUsersFactory(10);
```

## Test Utilities

### Database Helper

```typescript
import { createTestDatabase, seedBasicLookups } from '../utils/test-db.helper';

const db = createTestDatabase();
await seedBasicLookups(db);
```

### Auth Helper

```typescript
import { createUserAndGetToken } from '../utils/test-auth.helper';

const user = await createUserAndGetToken(app, db, 'student');
const token = user.token;
```

## E2E Tests

The E2E tests (`test/e2e/get-endpoints.e2e-spec.ts`) test all GET endpoints:

- Users: `/api/v1/users`, `/api/v1/users/:id`
- Courses: `/api/v1/lms/courses`, `/api/v1/lms/courses/:id`
- Events: `/api/v1/events`, `/api/v1/events/:id`
- Jobs: `/api/v1/jobs`, `/api/v1/jobs/:id`
- Social: `/api/v1/social/posts`, `/api/v1/social/groups`, `/api/v1/social/pages`
- Plans: `/api/v1/plans`
- Subscriptions: `/api/v1/subscriptions`
- Tickets: `/api/v1/tickets`, `/api/v1/tickets/:id`
- Comments: `/api/v1/comments`
- Notifications: `/api/v1/notifications`
- Lookups: `/api/v1/lookup-types`, `/api/v1/lookups`
- CMS: `/api/v1/cms`
- Media: `/api/v1/media`

## Data Validation Tests

The data validation tests (`test/e2e/data-validation.e2e-spec.ts`) verify:

- Response structure matches expected format
- Data types are correct
- Pagination works correctly
- Filtering works correctly
- Soft delete filtering works
- Error handling is proper

## Environment Setup

Make sure you have a test database configured:

```env
TEST_DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms_test
```

Or the tests will use the default:
```
postgresql://postgres:@localhost:5432/leap_lms_test
```

## Notes

- Tests use faker to generate realistic test data
- All tests verify that endpoints return data without errors
- E2E tests require a running database
- Integration tests mock dependencies for faster execution
- Test data is cleaned up after tests complete
