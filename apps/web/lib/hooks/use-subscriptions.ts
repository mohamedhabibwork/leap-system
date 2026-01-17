import { useQuery } from '@tanstack/react-query';
import { subscriptionsAPI, Subscription } from '@/lib/api/subscriptions';

/**
 * Fetch current user's subscriptions using REST API
 */
export function useMySubscriptions() {
  return useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: () => subscriptionsAPI.getMySubscriptions(),
  });
}

/**
 * Fetch current user's active subscription using REST API
 */
export function useMyActiveSubscription() {
  return useQuery({
    queryKey: ['subscriptions', 'me', 'active'],
    queryFn: () => subscriptionsAPI.getMyActiveSubscription(),
  });
}

/**
 * Fetch a single subscription by ID using REST API
 */
export function useSubscription(id: number) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsAPI.findOne(id),
    enabled: !!id,
  });
}
