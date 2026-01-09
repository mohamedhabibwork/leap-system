# GraphQL & gRPC Implementation Template

Use this template to implement any remaining table in ~30 minutes.

## Prerequisites

1. Module service already exists (e.g., `courses.service.ts`)
2. Database schema defined in `packages/database/src/schema/*.schema.ts`
3. Basic CRUD operations in service (`findAll`, `findOne`, `create`, `update`, `remove`)

## Step-by-Step Implementation

### Step 1: Create GraphQL Types (10 min)

#### File: `types/<entity>.type.ts`

```typescript
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

@ObjectType()
export class EntityName {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  // Required fields
  @Field()
  requiredField: string;

  @Field(() => Int)
  requiredNumber: number;

  // Optional fields
  @Field({ nullable: true })
  optionalField?: string;

  @Field(() => Int, { nullable: true })
  optionalNumber?: number;

  @Field(() => Float, { nullable: true })
  optionalDecimal?: number;

  // Date fields
  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // JSON fields
  @Field(() => JSONScalar, { nullable: true })
  jsonData?: any;

  // Relationships (add IDs)
  @Field(() => Int)
  userId: number;

  @Field(() => Int, { nullable: true })
  parentId?: number;
}
```

#### File: `types/<entity>.input.ts`

```typescript
import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { JSONScalar } from '../../../graphql/scalars/json.scalar';

@InputType()
export class CreateEntityInput {
  @Field()
  requiredField: string;

  @Field(() => Int)
  requiredNumber: number;

  @Field({ nullable: true })
  optionalField?: string;

  @Field(() => Int, { nullable: true })
  optionalNumber?: number;

  @Field(() => Float, { nullable: true })
  optionalDecimal?: number;

  @Field(() => JSONScalar, { nullable: true })
  jsonData?: any;

  @Field(() => Int)
  userId: number;
}

@InputType()
export class UpdateEntityInput {
  // All fields optional for partial updates
  @Field({ nullable: true })
  requiredField?: string;

  @Field(() => Int, { nullable: true })
  requiredNumber?: number;

  @Field({ nullable: true })
  optionalField?: string;

  @Field(() => JSONScalar, { nullable: true })
  jsonData?: any;
}
```

### Step 2: Create GraphQL Resolver (10 min)

#### File: `<module>.resolver.ts`

```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ModuleService } from './<module>.service';
import { EntityName } from './types/<entity>.type';
import { CreateEntityInput, UpdateEntityInput } from './types/<entity>.input';

@Resolver(() => EntityName)
@UseGuards(JwtAuthGuard)
export class ModuleResolver {
  constructor(private readonly moduleService: ModuleService) {}

  // === QUERIES ===

  @Query(() => [EntityName], { name: 'entities' })
  @Roles('admin') // Optional: restrict to specific roles
  async findAll(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ) {
    // If service returns paginated data
    const result = await this.moduleService.findAll(page, limit);
    return result.data;
    
    // If service returns array directly
    // return this.moduleService.findAll();
  }

  @Query(() => EntityName, { name: 'entity' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.moduleService.findOne(id);
  }

  // User-specific query
  @Query(() => [EntityName], { name: 'myEntities' })
  async findMy(@CurrentUser() user: any) {
    return this.moduleService.findByUser(user.sub || user.id);
  }

  // Query by foreign key
  @Query(() => [EntityName], { name: 'entitiesByParent' })
  async findByParent(@Args('parentId', { type: () => Int }) parentId: number) {
    return this.moduleService.findByParent(parentId);
  }

  // === MUTATIONS ===

  @Mutation(() => EntityName)
  @Roles('admin', 'instructor') // Set appropriate roles
  async createEntity(
    @Args('input') input: CreateEntityInput,
    @CurrentUser() user: any,
  ) {
    return this.moduleService.create({
      ...input,
      userId: user.sub || user.id, // Auto-assign current user if needed
    } as any);
  }

  @Mutation(() => EntityName)
  async updateEntity(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateEntityInput,
  ) {
    return this.moduleService.update(id, input as any);
  }

  @Mutation(() => String)
  @Roles('admin') // Usually only admins can delete
  async removeEntity(@Args('id', { type: () => Int }) id: number) {
    await this.moduleService.remove(id);
    return 'Entity deleted successfully';
  }
}
```

### Step 3: Add gRPC Proto Definition (5 min)

#### File: `grpc/proto/<module>.proto`

```protobuf
syntax = "proto3";

package module;

service ModuleService {
  rpc FindAll(FindAllRequest) returns (FindAllResponse);
  rpc FindOne(FindOneRequest) returns (Entity);
  rpc FindByUser(FindByUserRequest) returns (FindAllResponse);
  rpc Create(CreateRequest) returns (Entity);
  rpc Update(UpdateRequest) returns (Entity);
  rpc Delete(DeleteRequest) returns (DeleteResponse);
}

message Entity {
  int32 id = 1;
  string uuid = 2;
  string requiredField = 3;
  int32 requiredNumber = 4;
  string optionalField = 5;
  int32 optionalNumber = 6;
  float optionalDecimal = 7;
  string jsonData = 8;  // JSON as string
  string createdAt = 9; // Dates as ISO strings
  string updatedAt = 10;
  int32 userId = 11;
  int32 parentId = 12;
}

message FindAllRequest {
  int32 page = 1;
  int32 limit = 2;
}

message FindAllResponse {
  repeated Entity entities = 1;
}

message FindOneRequest {
  int32 id = 1;
}

message FindByUserRequest {
  int32 userId = 1;
}

message CreateRequest {
  string requiredField = 1;
  int32 requiredNumber = 2;
  string optionalField = 3;
  int32 optionalNumber = 4;
  float optionalDecimal = 5;
  string jsonData = 6;
  int32 userId = 7;
  int32 parentId = 8;
}

message UpdateRequest {
  int32 id = 1;
  string requiredField = 2;
  int32 requiredNumber = 3;
  string optionalField = 4;
  string jsonData = 5;
}

message DeleteRequest {
  int32 id = 1;
}

message DeleteResponse {
  string message = 1;
}
```

### Step 4: Create gRPC Controller (5 min)

#### File: `<module>.grpc-controller.ts`

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ModuleService } from './<module>.service';

@Controller()
export class ModuleGrpcController {
  constructor(private readonly moduleService: ModuleService) {}

  @GrpcMethod('ModuleService', 'FindAll')
  async findAll(data: { page?: number; limit?: number }) {
    // If service returns paginated data
    const result = await this.moduleService.findAll(data.page || 1, data.limit || 10);
    return { entities: result.data };
    
    // If service returns array directly
    // const entities = await this.moduleService.findAll();
    // return { entities };
  }

  @GrpcMethod('ModuleService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.moduleService.findOne(data.id);
  }

  @GrpcMethod('ModuleService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const entities = await this.moduleService.findByUser(data.userId);
    return { entities };
  }

  @GrpcMethod('ModuleService', 'Create')
  async create(data: any) {
    return this.moduleService.create(data);
  }

  @GrpcMethod('ModuleService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.moduleService.update(id, updateData);
  }

  @GrpcMethod('ModuleService', 'Delete')
  async delete(data: { id: number }) {
    await this.moduleService.remove(data.id);
    return { message: 'Entity deleted successfully' };
  }
}
```

### Step 5: Update Module (2 min)

#### File: `<module>.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ModuleController } from './<module>.controller';
import { ModuleService } from './<module>.service';
import { ModuleResolver } from './<module>.resolver';              // ADD THIS
import { ModuleGrpcController } from './<module>.grpc-controller'; // ADD THIS
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ModuleController,
    ModuleGrpcController, // ADD THIS
  ],
  providers: [
    ModuleService,
    ModuleResolver, // ADD THIS
  ],
  exports: [ModuleService],
})
export class ModuleModule {}
```

### Step 6: Update gRPC Module (1 min, if new proto)

If you created a **new** proto file, update `apps/backend/src/grpc/grpc.module.ts`:

```typescript
package: [
  'users', 
  'courses', 
  'module', // ADD YOUR PACKAGE NAME
  // ...
],
protoPath: [
  join(__dirname, 'proto/users.proto'),
  join(__dirname, 'proto/courses.proto'),
  join(__dirname, 'proto/module.proto'), // ADD YOUR PROTO PATH
  // ...
],
```

## Testing Your Implementation

### 1. Test GraphQL

Open `http://localhost:3000/graphql` and try:

```graphql
# Query all
query {
  entities {
    id
    requiredField
    createdAt
  }
}

# Query one
query {
  entity(id: 1) {
    id
    requiredField
    optionalField
  }
}

# Create (requires auth)
mutation {
  createEntity(input: {
    requiredField: "test"
    requiredNumber: 123
  }) {
    id
    requiredField
    createdAt
  }
}

# Update
mutation {
  updateEntity(id: 1, input: {
    requiredField: "updated"
  }) {
    id
    requiredField
    updatedAt
  }
}

# Delete
mutation {
  removeEntity(id: 1)
}
```

### 2. Test gRPC

Using `grpcurl` or BloomRPC:

```bash
# List services
grpcurl -plaintext localhost:5000 list

# Call method
grpcurl -plaintext -d '{"page": 1, "limit": 10}' \
  localhost:5000 module.ModuleService/FindAll
```

## Common Patterns

### For Bilingual Fields (EN/AR)
```typescript
@Field()
titleEn: string;

@Field({ nullable: true })
titleAr?: string;
```

### For Lookup References
```typescript
@Field(() => Int)
statusId: number; // References lookups table
```

### For Polymorphic Relationships
```typescript
@Field(() => Int)
entityId: number;

@Field()
entityType: string; // 'course', 'post', 'user', etc.
```

### For Counters
```typescript
@Field(() => Int)
likesCount: number;

@Field(() => Int)
viewsCount: number;
```

### For Boolean Flags
```typescript
@Field()
isActive: boolean;

@Field()
isVerified: boolean;
```

## Checklist

- [ ] Created `types/*.type.ts` with all database fields
- [ ] Created `types/*.input.ts` for create/update operations
- [ ] Created resolver with at least: `findAll`, `findOne`, `create`, `update`, `remove`
- [ ] Added appropriate `@Roles()` decorators
- [ ] Created or updated proto file with service definition
- [ ] Created gRPC controller with matching RPC methods
- [ ] Updated module to register resolver and gRPC controller
- [ ] Updated gRPC module if new proto file created
- [ ] Tested GraphQL queries in playground
- [ ] Tested GraphQL mutations with auth token
- [ ] Verified gRPC service is accessible

## Need Help?

**Reference Implementations:**
- Simple: `apps/backend/src/modules/lookups/`
- Medium: `apps/backend/src/modules/courses/`
- Complex: `apps/backend/src/modules/users/`

**Common Issues:**
1. **Type errors**: Check if all required fields are marked with `@Field()`
2. **Auth errors**: Ensure JWT token is passed in Authorization header
3. **Service errors**: Verify service methods return proper types
4. **gRPC errors**: Check proto field numbers are sequential and unique

---

**Estimated Time**: 30 minutes per table
**Files Created**: 5-6 per module
**Result**: Full GraphQL + gRPC support with authentication
