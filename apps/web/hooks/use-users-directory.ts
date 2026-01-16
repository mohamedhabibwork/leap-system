import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface UsersDirectoryParams {
  searchQuery?: string;
  roleFilter?: string;
  page?: number;
  limit?: number;
}

interface UsersDirectoryResponse {
  data: any[];
  total: number;
  totalPages: number;
}

/**
 * Hook to fetch users directory with search and filters
 */
export function useUsersDirectory(params: UsersDirectoryParams = {}) {
  const { searchQuery = '', roleFilter = '', page = 1, limit = 20 } = params;

  const { data, isLoading } = useQuery<UsersDirectoryResponse>({
    queryKey: ['users-directory', searchQuery, roleFilter, page, limit],
    queryFn: async () => {
      const queryParams: any = {
        page,
        limit,
      };
      
      if (searchQuery) {
        queryParams.search = searchQuery;
      }
      
      if (roleFilter) {
        queryParams.roleId = roleFilter;
      }

      return await apiClient.get<UsersDirectoryResponse>('/users', { params: queryParams });
    },
  });

  return {
    data: data?.data || [],
    isLoading,
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
  };
}
