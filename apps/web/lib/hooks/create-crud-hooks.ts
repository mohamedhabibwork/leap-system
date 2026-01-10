import { useQuery, useMutation, useInfiniteQuery, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface CrudHooksConfig {
  resource: string;
  endpoint: string;
  queryKey?: string[];
}

/**
 * Factory function to create standard CRUD hooks for a resource
 * @param config Configuration for the resource
 * @returns Object containing all CRUD hooks
 */
export function createCrudHooks<T = any>(config: CrudHooksConfig) {
  const { resource, endpoint, queryKey = [resource] } = config;

  /**
   * Hook to list all items
   */
  function useList(params?: any, options?: Partial<UseQueryOptions<any>>) {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: () => apiClient.get<T[]>(endpoint, { params }),
      ...options,
    });
  }

  /**
   * Hook to get a single item by ID
   */
  function useGet(id: number | string, options?: Partial<UseQueryOptions<any>>) {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: () => apiClient.get<T>(`${endpoint}/${id}`),
      enabled: !!id,
      ...options,
    });
  }

  /**
   * Hook to create a new item
   */
  function useCreate(options?: Partial<UseMutationOptions<any, any, any>>) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Partial<T>) => apiClient.post<T>(endpoint, data),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey });
        options?.onSuccess?.(...args);
      },
      ...options,
    });
  }

  /**
   * Hook to update an existing item
   */
  function useUpdate(options?: Partial<UseMutationOptions<any, any, any>>) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: Partial<T> }) =>
        apiClient.patch<T>(`${endpoint}/${id}`, data),
      onSuccess: (responseData, variables, ...rest) => {
        queryClient.invalidateQueries({ queryKey: [...queryKey, variables.id] });
        queryClient.invalidateQueries({ queryKey });
        options?.onSuccess?.(responseData, variables, ...rest);
      },
      ...options,
    });
  }

  /**
   * Hook to delete an item
   */
  function useDelete(options?: Partial<UseMutationOptions<any, any, any>>) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number | string) => apiClient.delete(`${endpoint}/${id}`),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey });
        options?.onSuccess?.(...args);
      },
      ...options,
    });
  }

  /**
   * Hook for infinite scroll/pagination
   */
  function useInfinite(params?: any, options?: Partial<UseQueryOptions<any>>) {
    return useInfiniteQuery({
      queryKey: [...queryKey, 'infinite', params],
      queryFn: ({ pageParam = 1 }) =>
        apiClient.get(endpoint, { params: { ...params, page: pageParam } }),
      getNextPageParam: (lastPage: any) => {
        const pagination = lastPage?.pagination;
        if (!pagination || pagination.page >= pagination.totalPages) {
          return undefined;
        }
        return pagination.page + 1;
      },
      initialPageParam: 1,
      ...options,
    });
  }

  /**
   * Hook for bulk operations
   */
  function useBulk(action: string, options?: Partial<UseMutationOptions<any, any, any>>) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ ids, data }: { ids: (number | string)[]; data?: any }) =>
        apiClient.post(`${endpoint}/bulk/${action}`, { ids, ...data }),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey });
        options?.onSuccess?.(...args);
      },
      ...options,
    });
  }

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
    useInfinite,
    useBulk,
  };
}

/**
 * Example usage:
 * 
 * const userHooks = createCrudHooks<User>({
 *   resource: 'users',
 *   endpoint: '/api/users',
 * });
 * 
 * // In component:
 * const { data: users } = userHooks.useList();
 * const { data: user } = userHooks.useGet(userId);
 * const createUser = userHooks.useCreate();
 */
