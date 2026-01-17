/**
 * TypeScript interfaces for PayPal Billing Plans API
 * Based on: https://developer.paypal.com/docs/api/payments.billing-plans/v1/
 * 
 * Note: This API is deprecated. Use /v1/billing/plans for new integrations.
 */

export interface PayPalCurrency {
  currency: string;
  value: string;
}

export interface PayPalChargeModel {
  id?: string;
  type: 'TAX' | 'SHIPPING';
  amount: PayPalCurrency;
}

export interface PayPalPaymentDefinition {
  id?: string;
  name: string;
  type: 'TRIAL' | 'REGULAR';
  frequency: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  frequency_interval: string;
  cycles: string;
  amount: PayPalCurrency;
  charge_models?: PayPalChargeModel[];
}

export interface PayPalMerchantPreferences {
  return_url: string;
  cancel_url: string;
  notify_url?: string;
  max_fail_attempts?: string;
  auto_bill_amount?: 'YES' | 'NO';
  initial_fail_amount_action?: 'CONTINUE' | 'CANCEL';
  setup_fee?: PayPalCurrency;
  accepted_payment_type?: string;
  char_set?: string;
}

export interface PayPalBillingPlan {
  id: string;
  state: 'CREATED' | 'ACTIVE' | 'INACTIVE';
  name: string;
  description: string;
  type: 'FIXED' | 'INFINITE';
  create_time?: string;
  update_time?: string;
  payment_definitions: PayPalPaymentDefinition[];
  merchant_preferences: PayPalMerchantPreferences;
  terms?: Array<{
    id: string;
    type: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
    occurrences: string;
    buyer_editable: string;
    max_billing_amount: PayPalCurrency;
    amount_range: PayPalCurrency;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalBillingPlanList {
  total_items?: string;
  total_pages?: string;
  plans: Array<{
    id: string;
    state: 'CREATED' | 'ACTIVE' | 'INACTIVE';
    name: string;
    description: string;
    type: 'FIXED' | 'INFINITE';
    create_time?: string;
    update_time?: string;
    links?: Array<{
      href: string;
      rel: string;
      method: string;
    }>;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

export interface PayPalError {
  name: string;
  debug_id?: string;
  message: string;
  information_link: string;
  details?: Array<{
    field: string;
    issue: string;
  }>;
}
