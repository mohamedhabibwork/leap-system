import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as paypal from '@paypal/checkout-server-sdk';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PayPalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const environment =
      this.configService.get<string>('PAYPAL_MODE') === 'live'
        ? new paypal.core.LiveEnvironment(
            this.configService.get<string>('PAYPAL_CLIENT_ID'),
            this.configService.get<string>('PAYPAL_CLIENT_SECRET')
          )
        : new paypal.core.SandboxEnvironment(
            this.configService.get<string>('PAYPAL_CLIENT_ID'),
            this.configService.get<string>('PAYPAL_CLIENT_SECRET')
          );

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: string, currency: string = 'USD') {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    });

    try {
      const order = await this.client.execute(request);
      return order.result;
    } catch (error) {
      console.error('PayPal createOrder error:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.client.execute(request);
      return capture.result;
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
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const baseUrl = this.configService.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

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
  }

  async createSubscription(planId: string, customId: string) {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.configService.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/v1/billing/subscriptions`,
        {
          plan_id: planId,
          custom_id: customId,
          application_context: {
            return_url: `${this.configService.get('FRONTEND_URL')}/payments/success`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/payments/cancel`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    return response.data;
  }

  async cancelSubscription(subscriptionId: string, reason: string = 'User requested cancellation') {
    const accessToken = await this.getAccessToken();
    const baseUrl = this.configService.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

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
   * Client tokens are required for frontend SDK initialization
   */
  async generateClientToken(): Promise<string> {
    // Check if PayPal is configured
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
    }

    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Failed to obtain PayPal access token. Please check your PayPal credentials.');
    }
    
    const baseUrl = this.configService.get<string>('PAYPAL_MODE') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v1/identity/generate-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )
      );

      const clientToken = response.data?.client_token;
      
      if (!clientToken || typeof clientToken !== 'string') {
        throw new Error('Invalid client token received from PayPal API');
      }

      return clientToken;
    } catch (error: any) {
      console.error('PayPal generateClientToken error:', error);
      
      // Provide more helpful error messages
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new Error('PayPal authentication failed. Please check your PayPal credentials.');
      }
      
      if (error?.response?.data) {
        throw new Error(`PayPal API error: ${error.response.data.message || 'Unknown error'}`);
      }
      
      throw error;
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
}
