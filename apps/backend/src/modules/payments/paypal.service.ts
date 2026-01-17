import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as paypal from '@paypal/checkout-server-sdk';
import { firstValueFrom } from 'rxjs';
import type {
  PayPalBillingPlan,
  PayPalBillingPlanList,
  PayPalPatchOperation,
} from './types/paypal-billing-plan.types';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const { mode, clientId, clientSecret } = this.getPayPalConfig();

    const environment =
      mode === 'live'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  /**
   * Get PayPal configuration from environment
   * Supports both typed config (env.PAYPAL_*) and direct access (PAYPAL_*) for backward compatibility
   */
  getPayPalConfig(): { mode: string; clientId: string | undefined; clientSecret: string | undefined } {
    const mode = this.configService.get<string>('env.PAYPAL_MODE') || 
                 this.configService.get<string>('PAYPAL_MODE') || 
                 'sandbox';
    const clientId = this.configService.get<string>('env.PAYPAL_CLIENT_ID') || 
                     this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('env.PAYPAL_CLIENT_SECRET') || 
                         this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    
    return { mode, clientId, clientSecret };
  }

  /**
   * Get PayPal API base URL based on mode
   */
  private getPayPalBaseUrl(): string {
    const { mode } = this.getPayPalConfig();
    return mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Create order with optional vault support for recurring payments
   * According to PayPal "Billing Agreement with Purchase" guide:
   * https://developer.paypal.com/upgrade/ec/guide/Billing%20Agreement%20With%20Purchase/
   * 
   * @param amount - Order amount
   * @param currency - Currency code (default: USD)
   * @param options - Additional options including vault settings
   */
  async createOrder(
    amount: string,
    currency: string = 'USD',
    options?: {
      storeInVault?: boolean;
      vaultId?: string;
      description?: string;
    },
  ) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    
    const orderBody: any = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    };

    // Add vault configuration for recurring payments
    // According to the guide: Use payment_source with vault settings
    if (options?.storeInVault || options?.vaultId) {
      orderBody.payment_source = {
        paypal: {
          vault: {
            store_in_vault: options.storeInVault ? 'ON_SUCCESS' : undefined,
            usage_pattern: 'RECURRING',
            usage_type: 'MERCHANT',
            ...(options.vaultId && { id: options.vaultId }),
          },
        },
      };
    }

    if (options?.description) {
      orderBody.purchase_units[0].description = options.description;
    }

    request.requestBody(orderBody);

    try {
      const order = await this.client.execute(request);
      return order.result;
    } catch (error) {
      console.error('PayPal createOrder error:', error);
      throw error;
    }
  }

  /**
   * Capture order and extract vault_id if available
   * According to PayPal "Billing Agreement with Purchase" guide:
   * After successful capture with vault enabled, the response contains payment_source with vault_id
   */
  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.client.execute(request);
      const result = capture.result;
      
      // Extract vault_id from payment_source if available
      // This is the payment method token for future recurring payments
      const vaultId = result?.payment_source?.paypal?.vault?.id;
      
      if (vaultId) {
        this.logger.debug(`Vault ID extracted from order capture: ${vaultId}`);
        // Add vault_id to result for frontend/backend use
        (result as any).vault_id = vaultId;
      }

      return result;
    } catch (error) {
      console.error('PayPal captureOrder error:', error);
      throw error;
    }
  }

  async refundPayment(captureId: string, amount?: string, currency?: string) {
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    
    if (amount && currency) {
      request.requestBody({
        amount: {
          value: amount,
          currency_code: currency,
        },
      });
    }

    try {
      const refund = await this.client.execute(request);
      return refund.result;
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }

  private async getAccessToken() {
    const { clientId, clientSecret } = this.getPayPalConfig();
    if (!clientId || !clientSecret) {
      throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const baseUrl = this.getPayPalBaseUrl();

   try {
    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
    );
    return response.data.access_token;
   } catch (error) {
    this.logger.error('Failed to get PayPal access token:', error);
    throw error;
   }

  }

  /**
   * Create setup token for vaulting payment method
   * According to PayPal "Billing Agreement with Purchase" guide:
   * https://developer.paypal.com/upgrade/ec/guide/Billing%20Agreement%20With%20Purchase/
   * 
   * Setup tokens are temporary (3-day expiry) and capture initial customer consent
   */
  async createSetupToken(): Promise<string> {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    try {
      this.logger.debug('Creating PayPal setup token for vault');
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v3/vault/setup-tokens`,
          {
            customer: {
              id: 'customer-' + Date.now(), // Temporary customer ID
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )
      );

      const setupToken = response.data?.id;
      if (!setupToken) {
        throw new Error('Setup token not found in PayPal response');
      }

      this.logger.debug('Successfully created setup token');
      return setupToken;
    } catch (error: any) {
      this.logger.error('Failed to create setup token:', error?.response?.data || error);
      throw error;
    }
  }

  /**
   * Create subscription using Orders API v2 with vault_id
   * According to PayPal "Billing Agreement with Purchase" guide:
   * https://developer.paypal.com/upgrade/ec/guide/Billing%20Agreement%20With%20Purchase/
   * 
   * This creates a subscription with immediate purchase and stores payment method for future recurring payments
   */
  async createSubscriptionWithVault(
    planId: string,
    userId: string,
    amount: string,
    currency: string = 'USD',
    vaultId?: string,
  ) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.configService.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    try {
      this.logger.debug(`Creating subscription with vault for plan ${planId}, user ${userId}`);

      // Use Orders API v2 with vault_id for recurring payments
      // According to the guide: POST /v2/checkout/orders with vault_id
      const orderPayload: any = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            description: `Subscription payment for plan ${planId}`,
          },
        ],
        payment_source: {
          paypal: {
            vault: {
              store_in_vault: 'ON_SUCCESS',
              usage_pattern: 'RECURRING',
              usage_type: 'MERCHANT',
            },
          },
        },
      };

      // If vault_id exists (from previous setup), use it for recurring payment
      if (vaultId) {
        orderPayload.payment_source.paypal.vault.id = vaultId;
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v2/checkout/orders`,
          orderPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )
      );

      this.logger.debug('Subscription order created successfully');
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create subscription with vault:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use createSubscriptionWithVault instead
   */
  async createSubscription(planId: string, customId: string) {
    // For now, use the new vault-based approach
    // In production, you should fetch plan price from database
    return this.createSubscriptionWithVault(planId, customId, '0.00');
  }

  async cancelSubscription(subscriptionId: string, reason: string = 'User requested cancellation') {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    return { success: true };
  }

  /**
   * Generate client token for PayPal SDK v6
   * 
   * According to PayPal SDK v6 upgrade guide:
   * https://developer.paypal.com/upgrade/ec/guide/Web%20SDK%20v6/
   * 
   * The server should:
   * 1. Authenticate with PayPal using server credentials
   * 2. Request a short-lived client token using /v1/oauth2/token with response_type=client_token
   * 3. Return it from an endpoint like /paypal-api/auth/browser-safe-client-token
   * 
   * Client tokens are browser-safe, short-lived tokens (not necessarily JWTs)
   * that replace client-id in URLs for better security.
   */
  async generateClientToken(): Promise<string> {
    // Check if PayPal is configured
    const { clientId, clientSecret } = this.getPayPalConfig();
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }
    
    const baseUrl = this.getPayPalBaseUrl();

    try {
      // According to PayPal SDK v6 docs, use /v1/oauth2/token with response_type=client_token
      // This is different from the identity/generate-token endpoint
      // https://developer.paypal.com/upgrade/ec/guide/Web%20SDK%20v6/
      this.logger.debug(`Generating PayPal client token from ${baseUrl}/v1/oauth2/token`);
      
      // Get frontend URL for domain binding (client tokens are domain-bound for security)
      // Note: PayPal doesn't accept "localhost" as a valid domain format
      // Domain binding is optional and should only be used for production domains
      const frontendUrl = this.configService.get<string>('env.FRONTEND_URL') || 
                          this.configService.get<string>('FRONTEND_URL') || 
                          'http://localhost:3001';
      
      let frontendDomain: string | null = null;
      
      try {
        const url = new URL(frontendUrl);
        frontendDomain = url.hostname;
        
        // PayPal doesn't accept localhost or 127.0.0.1 as valid domains
        // Skip domain binding for localhost/development environments
        if (frontendDomain === 'localhost' || frontendDomain === '127.0.0.1') {
          frontendDomain = null;
          this.logger.debug('Skipping domain binding for localhost (PayPal doesn\'t accept localhost as a valid domain)');
        }
      } catch (error) {
        // If URL parsing fails, skip domain binding
        frontendDomain = null;
        this.logger.warn(`Failed to parse FRONTEND_URL: ${frontendUrl}, skipping domain binding`);
      }
      
      // Create Basic Auth header
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      // Build form data with domain information
      // PayPal SDK v6 supports optional domains[] parameter to bind token to specific domains
      // Format: domains[]=domain1&domains[]=domain2
      // Note: Domain binding is optional - only include for production domains
      const formData = new URLSearchParams({
        grant_type: 'client_credentials',
        response_type: 'client_token',
      });
      
      // Add domain binding only for valid production domains
      // PayPal requires domains to be valid hostnames (not localhost)
      if (frontendDomain && frontendDomain !== 'localhost' && frontendDomain !== '127.0.0.1') {
        formData.append('domains[]', frontendDomain);
        this.logger.debug(`Requesting client token with domain binding: ${frontendDomain}`);
      } else {
        this.logger.debug('Requesting client token without domain binding (localhost/development mode)');
      }
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v1/oauth2/token`,
          formData.toString(),
          {
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
          }
        )
      );

      // Log the raw response for debugging
      this.logger.debug('PayPal oauth2/token response:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });

      // PayPal API returns: { access_token: "...", expires_in: 32400, ... }
      // The access_token field contains the client token for SDK v6
      const responseData = response.data;
      
      // Extract the access_token which is the client token for SDK v6
      const clientToken = responseData?.access_token;
      
      if (!clientToken || typeof clientToken !== 'string') {
        this.logger.error('Invalid PayPal client token response:', {
          responseData,
          responseDataType: typeof responseData,
          hasAccessToken: !!responseData?.access_token,
          allKeys: responseData ? Object.keys(responseData) : [],
        });
        throw new Error('Invalid client token received from PayPal API - access_token not found in response');
      }

      // Trim whitespace
      const trimmedToken = clientToken.trim();

      // Note: PayPal SDK v6 client tokens may not always be JWTs
      // They can be opaque bearer tokens (starting with A21AA...)
      // The SDK will validate the token format itself
      // this.logger.debug('Successfully generated PayPal client token', {
      //   tokenLength: trimmedToken.length,
      //   tokenPreview: trimmedToken.substring(0, 20) + '...',
      //   startsWithEyJ: trimmedToken.startsWith('eyJ'),
      //   startsWithA21: trimmedToken.startsWith('A21'),
      // });

      return trimmedToken;
    } catch (error: any) {
      // this.logger.error('PayPal generateClientToken error:', {
      //   message: error?.message,
      //   status: error?.response?.status,
      //   statusText: error?.response?.statusText,
      //   responseData: error?.response?.data,
      //   stack: error?.stack,
      // });
      
      // Provide more helpful error messages
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new Error('PayPal authentication failed. Please check your PayPal credentials.');
      }
      
      if (error?.response?.status === 404) {
        throw new Error('PayPal oauth2/token endpoint not found. Please check your PayPal API configuration.');
      }
      
      if (error?.response?.data) {
        const errorMessage = error.response.data.error_description || error.response.data.message || 'Unknown error';
        throw new Error(`PayPal API error: ${errorMessage}`);
      }
      
      // Re-throw with original message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`Failed to generate PayPal client token: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create order with cart items (for SDK v6)
   * If amount is provided, it will be used as the total.
   * Otherwise, items should have unit_amount values.
   */
  async createOrderWithCart(
    cart: Array<{ id: string; quantity: string }>,
    currency: string = 'USD',
    amount?: string,
  ) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    
    // If amount is provided, use it; otherwise calculate from items
    // Note: In production, you should fetch product prices from your database
    const totalAmount = amount || '0.00';
    
    const items = cart.map((item) => ({
      name: `Item ${item.id}`,
      quantity: item.quantity,
      unit_amount: {
        currency_code: currency,
        value: amount 
          ? (parseFloat(amount) / cart.length / parseFloat(item.quantity)).toFixed(2)
          : '0.00', // Should be fetched from product data in production
      },
    }));
    
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: items.reduce((sum, item) => 
                  sum + (parseFloat(item.unit_amount.value) * parseFloat(item.quantity)), 
                  0
                ).toFixed(2),
              },
            },
          },
          items,
        },
      ],
    });

    try {
      const order = await this.client.execute(request);
      return order.result;
    } catch (error) {
      console.error('PayPal createOrderWithCart error:', error);
      throw error;
    }
  }

  /**
   * Create a billing plan
   * According to PayPal Billing Plans API:
   * https://developer.paypal.com/docs/api/payments.billing-plans/v1/
   * 
   * Note: This API is deprecated. Use /v1/billing/plans instead for new integrations.
   * 
   * @param planData - Billing plan data
   * @returns Created billing plan
   */
  async createBillingPlan(planData: {
    name: string;
    description: string;
    type: 'FIXED' | 'INFINITE';
    payment_definitions: Array<{
      name: string;
      type: 'TRIAL' | 'REGULAR';
      frequency: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
      frequency_interval: string;
      cycles: string;
      amount: {
        currency: string;
        value: string;
      };
      charge_models?: Array<{
        type: 'TAX' | 'SHIPPING';
        amount: {
          currency: string;
          value: string;
        };
      }>;
    }>;
    merchant_preferences: {
      return_url: string;
      cancel_url: string;
      notify_url?: string;
      max_fail_attempts?: string;
      auto_bill_amount?: 'YES' | 'NO';
      initial_fail_amount_action?: 'CONTINUE' | 'CANCEL';
      setup_fee?: {
        currency: string;
        value: string;
      };
    };
  }) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    try {
      this.logger.debug('Creating PayPal billing plan:', { name: planData.name, type: planData.type });

      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v1/payments/billing-plans`,
          planData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )
      );

      this.logger.debug('Billing plan created successfully:', response.data.id);
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create billing plan:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * List billing plans
   * According to PayPal Billing Plans API:
   * https://developer.paypal.com/docs/api/payments.billing-plans/v1/
   * 
   * @param options - Query options (page, page_size, status)
   * @returns List of billing plans
   */
  async listBillingPlans(options?: {
    page?: string;
    page_size?: string;
    status?: 'CREATED' | 'ACTIVE' | 'INACTIVE' | 'ALL';
    total_required?: 'yes' | 'no';
  }) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page);
      if (options?.page_size) params.append('page_size', options.page_size);
      if (options?.status) params.append('status', options.status);
      if (options?.total_required) params.append('total_required', options.total_required);

      const queryString = params.toString();
      const url = `${baseUrl}/v1/payments/billing-plans${queryString ? `?${queryString}` : ''}`;

      this.logger.debug('Listing PayPal billing plans:', { options });

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        })
      );

      return response.data as PayPalBillingPlanList;
    } catch (error: any) {
      this.logger.error('Failed to list billing plans:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * Get billing plan details
   * According to PayPal Billing Plans API:
   * https://developer.paypal.com/docs/api/payments.billing-plans/v1/
   * 
   * @param planId - Billing plan ID
   * @returns Billing plan details
   */
  async getBillingPlan(planId: string) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    try {
      this.logger.debug('Getting PayPal billing plan:', planId);

      const response = await firstValueFrom(
        this.httpService.get(
          `${baseUrl}/v1/payments/billing-plans/${planId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
          }
        )
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get billing plan:', {
        planId,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * Update billing plan (typically to activate/deactivate)
   * According to PayPal Billing Plans API:
   * https://developer.paypal.com/docs/api/payments.billing-plans/v1/
   * 
   * @param planId - Billing plan ID
   * @param operations - Array of patch operations
   * @returns Update result
   */
  async updateBillingPlan(planId: string, operations: PayPalPatchOperation[]) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.getPayPalBaseUrl();

    try {
      this.logger.debug('Updating PayPal billing plan:', { planId, operations });

      const response = await firstValueFrom(
        this.httpService.patch(
          `${baseUrl}/v1/payments/billing-plans/${planId}`,
          operations,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )
      );

      this.logger.debug('Billing plan updated successfully');
      return response.data || { success: true };
    } catch (error: any) {
      this.logger.error('Failed to update billing plan:', {
        planId,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  }

  /**
   * Activate a billing plan
   * Convenience method to activate a plan by updating its state to ACTIVE
   * 
   * @param planId - Billing plan ID
   * @returns Update result
   */
  async activateBillingPlan(planId: string) {
    return this.updateBillingPlan(planId, [
      {
        op: 'replace',
        path: '/state',
        value: 'ACTIVE',
      },
    ]);
  }

  /**
   * Deactivate a billing plan
   * Convenience method to deactivate a plan by updating its state to INACTIVE
   * 
   * @param planId - Billing plan ID
   * @returns Update result
   */
  async deactivateBillingPlan(planId: string) {
    return this.updateBillingPlan(planId, [
      {
        op: 'replace',
        path: '/state',
        value: 'INACTIVE',
      },
    ]);
  }
}
