# Run Tests

Execute test suite and systematically fix any failures, ensuring code quality and functionality.

## Steps

1. **Run Backend Tests**
   - Navigate to `apps/backend`
   - Run `npm test` or `bun test`
   - Capture output and identify failures
   - Check both unit and integration tests

2. **Run Frontend Tests**
   - Navigate to `apps/web`
   - Run `npm test` or `bun test`
   - Capture output and identify failures
   - Check component tests and E2E tests

3. **Analyze Failures**
   - Categorize by type: flaky, broken, new failures
   - Prioritize fixes based on impact
   - Check if failures are related to recent changes
   - Identify root causes

4. **Fix Issues Systematically**
   - Start with the most critical failures
   - Fix one issue at a time
   - Re-run tests after each fix
   - Ensure no regressions

5. **Format Code**
   - Run `npm run format` or `bun run format`
   - Fix any formatting issues

6. **Lint Code**
   - Run `npm run lint` or `bun run lint`
   - Fix any linting errors

7. **Type Check**
   - Run `npm run type-check` or `tsc --noEmit`
   - Fix any TypeScript errors

8. **Final Verification**
   - Run all tests again
   - Ensure all tests pass
   - Verify code quality checks pass

## Test Categories

- **Unit Tests**: Test individual functions/methods in isolation
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Test complete user workflows
- **Component Tests**: Test React components

## Best Practices

- Write tests before fixing code (TDD approach when possible)
- Mock external dependencies
- Test behavior, not implementation
- Keep tests focused and readable
- Use descriptive test names
- Ensure tests are deterministic
