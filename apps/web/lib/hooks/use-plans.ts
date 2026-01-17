import { useQuery } from '@tanstack/react-query';
import { plansAPI, Plan } from '@/lib/api/plans';

/**
 * Fetch all plans using REST API
 */
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => plansAPI.findAll(),
  });
}

/**
 * Fetch all active plans using REST API
 */
export function useActivePlans() {
  return useQuery({
    queryKey: ['plans', 'active'],
    queryFn: () => plansAPI.findActive(),
  });
}

/**
 * Fetch a single plan by ID using REST API
 */
export function usePlan(id: number) {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => plansAPI.findOne(id),
    enabled: !!id,
  });
}

/**
 * Fetch a single plan by slug using REST API
 */
export function usePlanBySlug(slug: string) {
  return useQuery({
    queryKey: ['plans', 'slug', slug],
    queryFn: () => plansAPI.findBySlug(slug),
    enabled: !!slug,
  });
}
