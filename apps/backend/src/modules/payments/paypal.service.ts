import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(private configService: ConfigService) {
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

  // Note: For subscriptions, you would typically use PayPal Subscriptions API
  // which requires different setup. This is a placeholder for future implementation.
  async createSubscription(planId: string, customerId: string) {
    // TODO: Implement subscription creation using PayPal Subscriptions API
    throw new Error('Subscription creation not yet implemented');
  }

  async cancelSubscription(subscriptionId: string, reason?: string) {
    // TODO: Implement subscription cancellation
    throw new Error('Subscription cancellation not yet implemented');
  }
}
