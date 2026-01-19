# NestJS Skills

Specialized capabilities for working with NestJS backend development.

## Architecture Patterns

### Module Organization
- One module per domain/feature
- Use feature modules (not shared modules by default)
- Export only what's needed
- Use barrel exports (index.ts) for cleaner imports

### Dependency Injection
- Use constructor injection
- Prefer interfaces over concrete classes
- Use custom providers when needed
- Leverage NestJS DI container

### Repository Pattern
- Abstract data access in repositories
- Keep business logic in services
- Use repositories for database operations
- Implement generic repositories for common operations

## Common Patterns

### Service Pattern
```typescript
@Injectable()
export class ResourceService {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateDto): Promise<Resource> {
    this.logger.log(`Creating resource: ${dto.name}`);
    return this.repository.create(dto);
  }
}
```

### Controller Pattern
```typescript
@Controller('resources')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDto): Promise<Resource> {
    return this.service.create(dto);
  }
}
```

### DTO Pattern
```typescript
export class CreateResourceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Data Access

### Drizzle ORM Patterns
- Use Drizzle query builder
- Implement transactions for complex operations
- Use prepared statements for performance
- Handle database errors properly

### Query Patterns
```typescript
// Simple query
const result = await this.db
  .select()
  .from(resources)
  .where(eq(resources.id, id));

// Complex query with joins
const result = await this.db
  .select({
    resource: resources,
    user: users,
  })
  .from(resources)
  .innerJoin(users, eq(resources.userId, users.id))
  .where(eq(resources.id, id));
```

## Authentication & Authorization

### Guards
- Use JWT guards for authentication
- Use role guards for authorization
- Create custom decorators for cleaner code
- Implement permission-based access control

### Decorators
```typescript
// Custom decorator
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Error Handling

### Custom Exceptions
```typescript
export class ResourceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Resource with ID ${id} not found`);
  }
}
```

### Exception Filters
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
```

## Testing

### Unit Tests
- Test services in isolation
- Mock dependencies
- Test business logic
- Test error cases

### Integration Tests
- Test controller endpoints
- Test database operations
- Test authentication/authorization
- Use test database

## Performance

### Caching
- Use NestJS CacheModule
- Cache frequently accessed data
- Implement cache invalidation
- Use Redis for distributed caching

### Optimization
- Use database indexes
- Optimize queries (avoid N+1)
- Implement pagination
- Use connection pooling

## Security

### Input Validation
- Use class-validator in DTOs
- Validate all user inputs
- Sanitize user-generated content

### Security Headers
- Use Helmet middleware
- Configure CORS properly
- Use HTTPS in production
- Implement rate limiting

## Best Practices

1. **Keep controllers thin** - Delegate to services
2. **Use DTOs** - Validate and transform data
3. **Handle errors properly** - Use custom exceptions
4. **Log appropriately** - Use NestJS Logger
5. **Test thoroughly** - Unit and integration tests
6. **Document code** - Use JSDoc comments
7. **Follow SOLID principles** - Single responsibility, etc.
8. **Use TypeScript strictly** - No `any` types
9. **Implement proper error handling** - Don't ignore errors
10. **Use dependency injection** - Don't create instances manually
