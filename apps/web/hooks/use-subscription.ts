import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';

/**
 * Hook to manage subscription status
 */
export function useSubscription() {
  const { user, hasActiveSubscription, updateSubscription } = useAuthStore();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => apiClient.get('/subscriptions/my-subscriptions'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Get active subscription
      const active = Array.isArray(data)
        ? data.find((sub: any) => sub.status === 'active')
        : null;
      return active;
    },
  });

  // Update store when subscription data changes
  if (subscription && user) {
    updateSubscription({
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      expiresAt: subscription.endDate ? new Date(subscription.endDate) : null,
      planName: subscription.plan?.nameEn || null,
      maxCourses: subscription.plan?.maxCourses || null,
    });
  }

  return {
    subscription: user?.subscription || null,
    hasActiveSubscription: hasActiveSubscription(),
    isLoading,
    maxCourses: user?.subscription?.maxCourses || null,
  };
}
