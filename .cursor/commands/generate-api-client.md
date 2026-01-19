# Generate API Client

Create TypeScript API client functions and TanStack Query hooks for a NestJS endpoint.

## Steps

1. **Analyze Backend Endpoint**
   - Review controller methods
   - Identify DTOs and response types
   - Note authentication requirements
   - Check query parameters and filters

2. **Create API Client Functions**
   - Location: `apps/web/lib/api/{resource}.ts`
   - Create functions for each endpoint:
     - `get{Resource}List(params?)` - GET list
     - `get{Resource}(id)` - GET single
     - `create{Resource}(dto)` - POST
     - `update{Resource}(id, dto)` - PATCH/PUT
     - `delete{Resource}(id)` - DELETE
   - Use `apiClient` from `@/lib/api/client`
   - Add proper TypeScript types
   - Handle errors properly

3. **Create TanStack Query Hooks**
   - Location: `apps/web/lib/hooks/use-{resource}.ts` or use `createCrudHooks`
   - Create query hooks:
     - `use{Resource}List(params?)` - useQuery
     - `use{Resource}(id)` - useQuery
   - Create mutation hooks:
     - `useCreate{Resource}()` - useMutation
     - `useUpdate{Resource}()` - useMutation
     - `useDelete{Resource}()` - useMutation
   - Add proper cache invalidation
   - Add optimistic updates where appropriate

4. **Add Types**
   - Import types from `packages/shared-types` if available
   - Or define types matching backend DTOs
   - Export types for use in components

5. **Add Error Handling**
   - Handle API errors gracefully
   - Provide meaningful error messages
   - Use error boundaries where appropriate

## Code Template

```typescript
// apps/web/lib/api/{resource}.ts
import { apiClient } from '@/lib/api/client';
import type { Create{Resource}Dto, Update{Resource}Dto, {Resource}Response } from '@/types';

export const {resource}API = {
  getList: async (params?: any): Promise<{Resource}Response[]> => {
    return apiClient.get(`/{resource}`, { params });
  },

  getOne: async (id: string): Promise<{Resource}Response> => {
    return apiClient.get(`/{resource}/${id}`);
  },

  create: async (dto: Create{Resource}Dto): Promise<{Resource}Response> => {
    return apiClient.post(`/{resource}`, dto);
  },

  update: async (id: string, dto: Update{Resource}Dto): Promise<{Resource}Response> => {
    return apiClient.patch(`/{resource}/${id}`, dto);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/{resource}/${id}`);
  },
};

// apps/web/lib/hooks/use-{resource}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {resource}API } from '@/lib/api/{resource}';

export const use{Resource}List = (params?: any) => {
  return useQuery({
    queryKey: ['{resource}', params],
    queryFn: () => {resource}API.getList(params),
  });
};

export const use{Resource} = (id: string) => {
  return useQuery({
    queryKey: ['{resource}', id],
    queryFn: () => {resource}API.getOne(id),
    enabled: !!id,
  });
};

export const useCreate{Resource} = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: {resource}API.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{resource}'] });
    },
  });
};
```

## Requirements

- Use consistent naming conventions
- Add proper TypeScript types
- Handle errors properly
- Implement proper cache invalidation
- Use optimistic updates where appropriate
- Follow TanStack Query best practices
