/**
 * TanStack Query helper utilities
 */

import { QueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Default query client configuration
 */
export const defaultQueryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};

/**
 * Create a query client with custom config
 */
export function createQueryClient(config = {}) {
  return new QueryClient({
    defaultOptions: {
      ...defaultQueryConfig,
      ...config,
    },
  });
}

/**
 * Helper to create query keys
 */
export const queryKeys = {
  // Admin
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    users: (params?: any) => [...queryKeys.admin.all, 'users', params] as const,
    user: (id: number) => [...queryKeys.admin.all, 'users', id] as const,
    analytics: (params?: any) => [...queryKeys.admin.all, 'analytics', params] as const,
    moderation: (params?: any) => [...queryKeys.admin.all, 'moderation', params] as const,
  },

  // Courses
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.courses.lists(), params] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.courses.details(), id] as const,
    lessons: (courseId: number) => [...queryKeys.courses.detail(courseId), 'lessons'] as const,
    analytics: (courseId: number) => [...queryKeys.courses.detail(courseId), 'analytics'] as const,
  },

  // Social
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.posts.lists(), params] as const,
    detail: (id: number) => [...queryKeys.posts.all, 'detail', id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    detail: (id: number) => [...queryKeys.users.all, 'detail', id] as const,
    connections: () => [...queryKeys.users.all, 'connections'] as const,
  },

  // Instructor
  instructor: {
    all: ['instructor'] as const,
    dashboard: () => [...queryKeys.instructor.all, 'dashboard'] as const,
    courses: (params?: any) => [...queryKeys.instructor.all, 'courses', params] as const,
    students: (params?: any) => [...queryKeys.instructor.all, 'students', params] as const,
    analytics: (params?: any) => [...queryKeys.instructor.all, 'analytics', params] as const,
  },

  // Events
  events: {
    all: ['events'] as const,
    list: (params?: any) => [...queryKeys.events.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.events.all, 'detail', id] as const,
  },

  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (params?: any) => [...queryKeys.jobs.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const,
  },
};

/**
 * Helper to create optimistic update handlers
 */
export function createOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: any[],
  updater: (old: T | undefined) => T
) {
  return {
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<T>(queryKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<T>(queryKey, updater(previousData));
      }

      return { previousData };
    },
    onError: (_err: any, _variables: any, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData<T>(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Helper to create paginated query options
 */
export function createPaginatedOptions(params?: any): Partial<UseQueryOptions> {
  return {
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds for paginated data
  };
}

/**
 * Helper to create infinite query config
 */
export function createInfiniteQueryConfig(params?: any) {
  return {
    queryKey: ['infinite', params],
    getNextPageParam: (lastPage: any) => {
      const pagination = lastPage?.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
    initialPageParam: 1,
    ...createPaginatedOptions(params),
  };
}

/**
 * Helper to prefetch data
 */
export async function prefetchQuery(
  queryClient: QueryClient,
  queryKey: any[],
  queryFn: () => Promise<any>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Helper to batch invalidate queries
 */
export function invalidateQueries(queryClient: QueryClient, keys: any[][]) {
  return Promise.all(
    keys.map((key) =>
      queryClient.invalidateQueries({ queryKey: key })
    )
  );
}

/**
 * Helper to create mutation with toast feedback
 */
export function createMutationWithToast<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any) => void;
  }
): UseMutationOptions<TData, any, TVariables> {
  return {
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (options?.successMessage) {
        // Toast would be shown here - integrate with your toast system
        console.log('Success:', options.successMessage);
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      if (options?.errorMessage) {
        console.error('Error:', options.errorMessage, error);
      }
      options?.onError?.(error);
    },
  };
}

/**
 * Helper to get all data from infinite query
 */
export function getInfiniteQueryData<T>(data: any): T[] {
  if (!data?.pages) return [];
  return data.pages.flatMap((page: any) => page.data || []);
}

/**
 * Helper to check if query is empty
 */
export function isQueryEmpty(data: any): boolean {
  if (!data) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (data?.data && Array.isArray(data.data)) return data.data.length === 0;
  return false;
}

/**
 * Helper to handle query errors
 */
export function getQueryError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Helper to create dependent queries
 */
export function createDependentQuery<T>(
  enabled: boolean,
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions>
) {
  return {
    ...options,
    enabled,
    queryFn,
  };
}
