import { ConfigService } from '@nestjs/config';
export declare class PayPalService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    createOrder(amount: string, currency?: string): Promise<any>;
    captureOrder(orderId: string): Promise<any>;
    refundPayment(captureId: string, amount?: string, currency?: string): Promise<any>;
    createSubscription(planId: string, customerId: string): Promise<void>;
    cancelSubscription(subscriptionId: string, reason?: string): Promise<void>;
}
//# sourceMappingURL=paypal.service.d.ts.map