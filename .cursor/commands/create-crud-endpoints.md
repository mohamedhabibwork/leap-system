# Create CRUD Endpoints

Generate complete CRUD (Create, Read, Update, Delete) endpoints for a resource in NestJS backend and corresponding Next.js frontend integration.

## Steps

1. **Backend Implementation**

   a. **Create DTOs**
   - `create-{resource}.dto.ts` with validation
   - `update-{resource}.dto.ts` with PartialType
   - `{resource}-query.dto.ts` for filtering/pagination
   - `{resource}-response.dto.ts` for API responses

   b. **Update Service**
   - `create()` method with validation
   - `findAll()` with pagination and filtering
   - `findOne(id)` method
   - `update(id, dto)` method
   - `remove(id)` method
   - Add proper error handling

   c. **Update Controller**
   - `POST /{resource}` - Create
   - `GET /{resource}` - List with pagination
   - `GET /{resource}/:id` - Get one
   - `PATCH /{resource}/:id` - Update
   - `DELETE /{resource}/:id` - Delete
   - Add proper decorators and guards

2. **Frontend Implementation**

   a. **Create API Client**
   - Add methods to `apps/web/lib/api/{resource}.ts`
   - Implement all CRUD operations
   - Add proper TypeScript types

   b. **Create TanStack Query Hooks**
   - `use{Resource}List()` - Query hook
   - `use{Resource}(id)` - Single item query
   - `useCreate{Resource}()` - Mutation hook
   - `useUpdate{Resource}()` - Mutation hook
   - `useDelete{Resource}()` - Mutation hook
   - Add proper cache invalidation

   c. **Create UI Components**
   - List component with pagination
   - Form component for create/update
   - Detail view component
   - Delete confirmation dialog

3. **Add Validation**
   - Backend: Use class-validator in DTOs
   - Frontend: Use form validation (react-hook-form + zod)
   - Add proper error messages

4. **Add Tests**
   - Backend: Service and controller tests
   - Frontend: Component and hook tests

## Code Requirements

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement pagination for list endpoints
- Add filtering and sorting support
- Use proper error handling
- Add authentication/authorization guards
- Implement proper TypeScript types
- Add proper logging

## Example Structure

```typescript
// Backend Controller
@Controller('resources')
export class ResourceController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateResourceDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: ResourceQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```
