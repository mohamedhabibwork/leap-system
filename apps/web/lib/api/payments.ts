import apiClient from './client';

export interface CartItem {
  id: string;
  quantity: string;
}

export interface CreateOrderRequest {
  amount?: string;
  currency?: string;
  cart?: CartItem[];
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface CaptureOrderRequest {
  orderId: string;
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  payment?: any;
}

export interface ClientTokenResponse {
  clientToken: string;
}

/**
 * Payment API functions for PayPal SDK v6
 */
export const paymentsAPI = {
  /**
   * Get client token for PayPal SDK initialization
   */
  getClientToken: () =>
    apiClient.get<ClientTokenResponse>('/payments/client-token'),

  /**
   * Create PayPal order
   */
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<CreateOrderResponse>('/payments/create-order', data),

  /**
   * Capture PayPal order
   */
  captureOrder: (data: CaptureOrderRequest) =>
    apiClient.post<CaptureOrderResponse>('/payments/capture-order', data),

  /**
   * Create PayPal subscription
   */
  createSubscription: (planId: string) =>
    apiClient.post('/payments/create-subscription', { planId }),

  /**
   * Cancel PayPal subscription
   */
  cancelSubscription: (subscriptionId: string) =>
    apiClient.post(`/payments/cancel-subscription/${subscriptionId}`, {}),
};
