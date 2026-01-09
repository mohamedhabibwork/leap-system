"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const paypal = __importStar(require("@paypal/checkout-server-sdk"));
let PayPalService = class PayPalService {
    configService;
    client;
    constructor(configService) {
        this.configService = configService;
        const environment = this.configService.get('PAYPAL_MODE') === 'live'
            ? new paypal.core.LiveEnvironment(this.configService.get('PAYPAL_CLIENT_ID'), this.configService.get('PAYPAL_CLIENT_SECRET'))
            : new paypal.core.SandboxEnvironment(this.configService.get('PAYPAL_CLIENT_ID'), this.configService.get('PAYPAL_CLIENT_SECRET'));
        this.client = new paypal.core.PayPalHttpClient(environment);
    }
    async createOrder(amount, currency = 'USD') {
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
        }
        catch (error) {
            console.error('PayPal createOrder error:', error);
            throw error;
        }
    }
    async captureOrder(orderId) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        try {
            const capture = await this.client.execute(request);
            return capture.result;
        }
        catch (error) {
            console.error('PayPal captureOrder error:', error);
            throw error;
        }
    }
    async refundPayment(captureId, amount, currency) {
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
        }
        catch (error) {
            console.error('PayPal refund error:', error);
            throw error;
        }
    }
    async createSubscription(planId, customerId) {
        throw new Error('Subscription creation not yet implemented');
    }
    async cancelSubscription(subscriptionId, reason) {
        throw new Error('Subscription cancellation not yet implemented');
    }
};
exports.PayPalService = PayPalService;
exports.PayPalService = PayPalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayPalService);
//# sourceMappingURL=paypal.service.js.map