# Backend Cursor Rules

This directory contains Cursor AI rules specific to the NestJS backend application.

## Rules Overview

### `backend-nestjs-rules.mdc`
Comprehensive guidelines for developing the NestJS backend, including:
- NestJS module structure and organization
- Controller and service patterns
- DTOs and validation
- Drizzle ORM database queries
- Authentication and authorization
- GraphQL resolvers
- WebSocket gateways
- Microservices (RabbitMQ, Kafka)
- Redis caching
- File storage (MinIO/S3)
- Error handling
- Testing strategies
- Performance optimization
- Security best practices

## When These Rules Apply

These rules automatically apply when working on files in the `apps/backend/` directory, including:
- `*.ts` files (TypeScript source files)
- `*.controller.ts` (NestJS controllers)
- `*.service.ts` (NestJS services)
- `*.module.ts` (NestJS modules)
- `*.dto.ts` (Data Transfer Objects)
- `*.resolver.ts` (GraphQL resolvers)
- `*.gateway.ts` (WebSocket gateways)
- `*.guard.ts`, `*.interceptor.ts`, `*.filter.ts` (NestJS utilities)

## Tech Stack Reference

**Core:**
- NestJS 10.4+
- TypeScript 5.7+
- Node.js 20+

**Database & Caching:**
- PostgreSQL 18 (via Drizzle ORM)
- Redis 7 (via ioredis)

**Messaging:**
- RabbitMQ 3 (via amqplib)
- Apache Kafka 2.2 (via kafkajs)

**APIs:**
- REST (Express)
- GraphQL (Apollo Server)
- WebSocket (Socket.io)

**Storage & Auth:**
- MinIO (S3-compatible)
- Keycloak OIDC
- JWT (passport-jwt)

## Key Patterns

### Module Structure
```
src/modules/[feature]/
├── [feature].module.ts
├── [feature].controller.ts
├── [feature].service.ts
├── dto/
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
└── [feature].resolver.ts (optional)
```

### Controller Example
```typescript
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles('admin', 'instructor')
  async findAll(@Query() query: PaginationDto) {
    return this.coursesService.findAll(query);
  }
}
```

### Service Example
```typescript
@Injectable()
export class CoursesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: PaginationDto) {
    return this.db.query.courses.findMany({
      where: eq(courses.isPublished, true),
      limit: query.limit,
      offset: query.offset,
    });
  }
}
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Project README](../../../README.md)
- [Backend Package.json](../package.json)

## Workspace-Level Rules

These app-specific rules complement the workspace-level rules in `.cursor/rules/` at the project root. The workspace rules cover general TypeScript, testing, and project-wide conventions.
