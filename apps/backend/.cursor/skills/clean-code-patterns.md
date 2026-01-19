# Clean Code Patterns for NestJS

Specialized clean code patterns and techniques for NestJS backend development.

## Service Layer Patterns

### Single Responsibility Service
```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async processOrder(orderId: string): Promise<Order> {
    const order = await this.validateAndPrepareOrder(orderId);
    await this.processPayment(order);
    await this.sendConfirmation(order);
    return order;
  }

  private async validateAndPrepareOrder(orderId: string): Promise<Order> {
    // Single responsibility: validation and preparation
  }

  private async processPayment(order: Order): Promise<void> {
    // Single responsibility: payment processing
  }

  private async sendConfirmation(order: Order): Promise<void> {
    // Single responsibility: notifications
  }
}
```

### Command Pattern for Complex Operations
```typescript
interface Command {
  execute(): Promise<void>;
}

@Injectable()
export class CreateUserCommand implements Command {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(): Promise<void> {
    // Complex operation broken into steps
  }
}
```

## Repository Patterns

### Generic Repository Base
```typescript
export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

@Injectable()
export class UserRepository extends BaseRepository<User> {
  // Implementation
}
```

### Query Builder Pattern
```typescript
@Injectable()
export class UserRepository {
  private buildUserQuery(filters: UserFilters) {
    let query = this.db.select().from(users);
    
    if (filters.role) {
      query = query.where(eq(users.role, filters.role));
    }
    
    if (filters.active !== undefined) {
      query = query.where(eq(users.isActive, filters.active));
    }
    
    return query;
  }
}
```

## Error Handling Patterns

### Custom Exception Hierarchy
```typescript
export abstract class DomainException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    super(message, statusCode);
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}
```

### Result Pattern for Operations
```typescript
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string,
  ) {}

  static success<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static failure<T>(error: string): Result<T> {
    return new Result(false, undefined, error);
  }
}
```

## Validation Patterns

### Fluent Validation
```typescript
@Injectable()
export class UserValidator {
  validateCreate(dto: CreateUserDto): ValidationResult {
    const errors: string[] = [];

    if (!dto.email || !this.isValidEmail(dto.email)) {
      errors.push('Invalid email format');
    }

    if (!dto.password || dto.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }
}
```

## Testing Patterns

### Test Fixtures
```typescript
export class UserTestFixture {
  static createUserDto(overrides?: Partial<CreateUserDto>): CreateUserDto {
    return {
      email: 'test@example.com',
      password: 'password123',
      ...overrides,
    };
  }

  static createUser(overrides?: Partial<User>): User {
    return {
      id: '1',
      email: 'test@example.com',
      ...overrides,
    };
  }
}
```

### Service Test Pattern
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserService(repository);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const dto = UserTestFixture.createUserDto();
      const expected = UserTestFixture.createUser();

      repository.create.mockResolvedValue(expected);

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });
  });
});
```

## Code Organization Patterns

### Feature Module Structure
```
modules/
  users/
    ├── users.module.ts
    ├── users.service.ts
    ├── users.controller.ts
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── entities/
    │   └── user.entity.ts
    ├── repositories/
    │   └── user.repository.ts
    └── __tests__/
        ├── users.service.spec.ts
        └── users.controller.spec.ts
```

### Barrel Exports
```typescript
// index.ts
export * from './users.service';
export * from './users.controller';
export * from './dto';
export * from './entities';
```

## Performance Patterns

### Caching Pattern
```typescript
@Injectable()
export class UserService {
  @Cacheable('users')
  async findById(id: string): Promise<User> {
    return this.repository.findById(id);
  }

  @CacheEvict('users')
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.repository.update(id, dto);
  }
}
```

### Batch Operations
```typescript
async createMany(dtos: CreateUserDto[]): Promise<User[]> {
  return this.db.transaction(async (tx) => {
    const users = await Promise.all(
      dtos.map(dto => tx.insert(users).values(dto).returning())
    );
    return users.flat();
  });
}
```
