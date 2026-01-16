import { useQuery, useMutation, useInfiniteQuery, useQueryClient, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import { AxiosRequestConfig } from 'axios';

export interface CrudHooksConfig {
  resource: string;
  endpoint: string;
  queryKey?: string[];
  defaultHeaders?: Record<string, string>;
  getToken?: () => Promise<string | null> | string | null;
}

/**
 * Factory function to create standard CRUD hooks for a resource
 * @param config Configuration for the resource
 * @returns Object containing all CRUD hooks
 */
export function createCrudHooks<T = any>(config: CrudHooksConfig) {
  const { resource, endpoint, queryKey = [resource], defaultHeaders, getToken } = config;

  /**
   * Helper to create request config with token and headers
   */
  const createRequestConfig = async (additionalConfig?: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    const headers: Record<string, string> = { ...defaultHeaders };
    
    // Get token if getToken function is provided
    if (getToken) {
      const token = typeof getToken === 'function' ? await getToken() : getToken;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return {
      ...additionalConfig,
      headers: {
        ...headers,
        ...(additionalConfig?.headers as Record<string, string>),
      },
    };
  };

  /**
   * Hook to list all items
   */
  function useList(params?: any, options?: Partial<UseQueryOptions<any>>) {
    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: async () => {
        const config = await createRequestConfig({ params });
        return apiClient.get<T[]>(endpoint, config);
      },
      ...options,
    });
  }

  /**
   * Hook to get a single item by ID
   */
  function useGet(id: number | string, options?: Partial<UseQueryOptions<any>>) {
    return useQuery({
      queryKey: [...queryKey, id],
      queryFn: async () => {
        const config = await createRequestConfig();
        return apiClient.get<T>(`${endpoint}/${id}`, config);
      },
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
      mutationFn: async (data: Partial<T>) => {
        const config = await createRequestConfig();
        return apiClient.post<T>(endpoint, data, config);
      },
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
      mutationFn: async ({ id, data }: { id: number | string; data: Partial<T> }) => {
        const config = await createRequestConfig();
        return apiClient.patch<T>(`${endpoint}/${id}`, data, config);
      },
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
      mutationFn: async (id: number | string) => {
        const config = await createRequestConfig();
        return apiClient.delete(`${endpoint}/${id}`, config);
      },
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
  function useInfinite(params?: any, options?: Partial<UseInfiniteQueryOptions<any, Error, any, any, readonly unknown[], number>>) {
    return useInfiniteQuery({
      queryKey: [...queryKey, 'infinite', params],
      queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
        const config = await createRequestConfig({ params: { ...params, page: pageParam } });
        return apiClient.get(endpoint, config);
      },
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
      mutationFn: async ({ ids, data }: { ids: (number | string)[]; data?: any }) => {
        const config = await createRequestConfig();
        return apiClient.post(`${endpoint}/bulk/${action}`, { ids, ...data }, config);
      },
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
 * // Basic usage (token handled automatically by apiClient)
 * const userHooks = createCrudHooks<User>({
 *   resource: 'users',
 *   endpoint: '/api/users',
 * });
 * 
 * // With custom token function
 * const userHooks = createCrudHooks<User>({
 *   resource: 'users',
 *   endpoint: '/api/users',
 *   getToken: async () => {
 *     const session = await getSession();
 *     return session?.accessToken || null;
 *   },
 * });
 * 
 * // With default headers
 * const userHooks = createCrudHooks<User>({
 *   resource: 'users',
 *   endpoint: '/api/users',
 *   defaultHeaders: {
 *     'X-Custom-Header': 'value',
 *   },
 * });
 * 
 * // In component:
 * const { data: users } = userHooks.useList();
 * const { data: user } = userHooks.useGet(userId);
 * const createUser = userHooks.useCreate();
 */
