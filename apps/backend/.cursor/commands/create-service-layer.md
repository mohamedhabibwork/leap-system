# Create Service Layer

Create a complete service layer following clean code principles for a NestJS module.

## Steps

1. **Define Service Interface**
   - Create interface for service contract
   - Define method signatures
   - Use proper TypeScript types
   - Document with JSDoc

2. **Implement Service Class**
   - Implement business logic
   - Use dependency injection
   - Keep methods focused
   - Handle errors properly

3. **Create DTOs**
   - Create DTOs for input/output
   - Add validation decorators
   - Use class-validator
   - Create separate DTOs for different operations

4. **Implement Repository**
   - Abstract data access
   - Keep database logic separate
   - Use transactions when needed
   - Handle database errors

5. **Add Error Handling**
   - Create custom exceptions
   - Handle errors appropriately
   - Add proper logging
   - Return meaningful error messages

6. **Write Tests**
   - Unit tests for service
   - Mock dependencies
   - Test error cases
   - Test edge cases

## Code Template

```typescript
// service.interface.ts
export interface IResourceService {
  create(dto: CreateResourceDto): Promise<Resource>;
  findAll(query: ResourceQueryDto): Promise<PaginatedResponse<Resource>>;
  findOne(id: string): Promise<Resource>;
  update(id: string, dto: UpdateResourceDto): Promise<Resource>;
  remove(id: string): Promise<void>;
}

// service.ts
@Injectable()
export class ResourceService implements IResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly repository: ResourceRepository,
    private readonly validator: ResourceValidator,
  ) {}

  async create(dto: CreateResourceDto): Promise<Resource> {
    await this.validator.validateCreate(dto);
    const resource = await this.repository.create(dto);
    this.logger.log(`Resource created: ${resource.id}`);
    return resource;
  }

  // ... other methods
}
```

## Clean Code Requirements

- Single responsibility
- Small, focused methods
- Meaningful names
- Proper error handling
- Type safety
- No duplication
- Self-documenting code
