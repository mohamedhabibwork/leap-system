import { useQuery } from '@tanstack/react-query';
import { lookupsAPI, type LookupType, type Lookup, type LookupsByTypeQuery } from '../api/lookups';

/**
 * Query keys for lookups
 * Following TanStack Query best practices with hierarchical structure
 */
export const lookupKeys = {
  all: ['lookups'] as const,
  types: {
    all: ['lookups', 'types'] as const,
    lists: () => [...lookupKeys.types.all, 'list'] as const,
    details: () => [...lookupKeys.types.all, 'detail'] as const,
    detail: (id: number) => [...lookupKeys.types.details(), id] as const,
    byCode: (code: string) => [...lookupKeys.types.details(), 'code', code] as const,
  },
  values: {
    all: ['lookups', 'values'] as const,
    lists: () => [...lookupKeys.values.all, 'list'] as const,
    byType: (typeCode: string, query?: LookupsByTypeQuery) =>
      [...lookupKeys.values.lists(), typeCode, query] as const,
    details: () => [...lookupKeys.values.all, 'detail'] as const,
    detail: (id: number) => [...lookupKeys.values.details(), id] as const,
  },
} as const;

/**
 * Hook to fetch all lookup types
 * Cached for 5 minutes as lookup types rarely change
 */
export function useLookupTypes() {
  return useQuery({
    queryKey: lookupKeys.types.lists(),
    queryFn: () => lookupsAPI.getLookupTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch a single lookup type by ID
 */
export function useLookupType(id: number) {
  return useQuery({
    queryKey: lookupKeys.types.detail(id),
    queryFn: () => lookupsAPI.getLookupTypeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single lookup type by code
 */
export function useLookupTypeByCode(code: string) {
  return useQuery({
    queryKey: lookupKeys.types.byCode(code),
    queryFn: () => lookupsAPI.getLookupTypeByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch lookups by type code
 * Useful for populating dropdowns, select fields, etc.
 * 
 * @param typeCode - The code of the lookup type (e.g., 'user_role', 'course_status')
 * @param query - Optional query parameters for filtering
 * @param options - Additional query options
 */
export function useLookupsByType(
  typeCode: string,
  query?: LookupsByTypeQuery,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: lookupKeys.values.byType(typeCode, query),
    queryFn: () => lookupsAPI.getLookupsByType(typeCode, query),
    enabled: options?.enabled !== false && !!typeCode,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single lookup by ID
 */
export function useLookup(id: number) {
  return useQuery({
    queryKey: lookupKeys.values.detail(id),
    queryFn: () => lookupsAPI.getLookupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Helper hook to get localized lookup name based on current locale
 * This is a convenience hook that wraps useLookupsByType and provides
 * a helper function to get the localized name
 */
export function useLocalizedLookups(typeCode: string, locale: 'en' | 'ar' = 'en') {
  const { data: lookups, ...rest } = useLookupsByType(typeCode);

  const getLocalizedName = (code: string): string | undefined => {
    const lookup = lookups?.find((l) => l.code === code);
    if (!lookup) return undefined;
    return locale === 'ar' && lookup.nameAr ? lookup.nameAr : lookup.nameEn;
  };

  return {
    lookups,
    getLocalizedName,
    ...rest,
  };
}
