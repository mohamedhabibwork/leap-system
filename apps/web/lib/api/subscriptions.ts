import apiClient from './client';

export interface Subscription {
  id: number;
  uuid: string;
  userId: number;
  planId: number;
  statusId: number;
  billingCycleId: number;
  amountPaid: number;
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  autoRenew: boolean;
  createdAt: string;
}

/**
 * Subscriptions API functions using REST API
 */
export const subscriptionsAPI = {
  /**
   * Get current user's subscriptions
   */
  getMySubscriptions: () => apiClient.get<Subscription[]>('/subscriptions/me'),

  /**
   * Get current user's active subscription
   */
  getMyActiveSubscription: () => apiClient.get<Subscription | null>('/subscriptions/me/active'),

  /**
   * Get subscription by ID
   */
  findOne: (id: number) => apiClient.get<Subscription>(`/subscriptions/${id}`),

  /**
   * Cancel subscription
   */
  cancel: (id: number) => apiClient.post(`/subscriptions/${id}/cancel`, {}),
};
