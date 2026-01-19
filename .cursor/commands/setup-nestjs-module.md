# Setup NestJS Module

Scaffold a complete NestJS module with all necessary files following project conventions.

## Steps

1. **Prompt for module details**
   - Module name (e.g., `notifications`, `payments`)
   - Domain/feature description
   - Required endpoints (CRUD operations)

2. **Create module structure**
   ```
   apps/backend/src/modules/{module-name}/
   ├── {module-name}.module.ts
   ├── {module-name}.service.ts
   ├── {module-name}.controller.ts
   ├── dto/
   │   ├── create-{module-name}.dto.ts
   │   ├── update-{module-name}.dto.ts
   │   └── {module-name}-query.dto.ts
   ├── entities/
   │   └── {module-name}.entity.ts (if needed)
   └── __tests__/
       ├── {module-name}.service.spec.ts
       └── {module-name}.controller.spec.ts
   ```

3. **Generate module file**
   - Import necessary dependencies
   - Configure module with providers, controllers, imports, exports
   - Follow SOLID principles

4. **Generate service file**
   - Implement business logic
   - Use dependency injection
   - Add proper error handling
   - Include logging with NestJS Logger
   - Use repository pattern for data access

5. **Generate controller file**
   - Keep controllers thin (delegation only)
   - Use proper HTTP decorators (@Get, @Post, @Put, @Delete, @Patch)
   - Implement proper status codes
   - Add validation pipes
   - Use guards for authentication/authorization

6. **Generate DTOs**
   - Use class-validator decorators
   - Create separate DTOs for create, update, and query operations
   - Add proper validation rules
   - Use class-transformer for transformations

7. **Add to main module**
   - Import the new module in `app.module.ts`

8. **Generate tests**
   - Unit tests for service
   - Integration tests for controller
   - Mock dependencies properly

## Code Style Requirements

- Follow NestJS best practices
- Use dependency injection
- Implement proper error handling
- Add logging
- Use TypeScript strictly (no `any`)
- Follow SOLID principles
- Keep methods small and focused
- Use descriptive names

## Example Output Structure

```typescript
// {module-name}.module.ts
@Module({
  imports: [/* required modules */],
  controllers: [{ModuleName}Controller],
  providers: [{ModuleName}Service, {ModuleName}Repository],
  exports: [{ModuleName}Service],
})
export class {ModuleName}Module {}
```
