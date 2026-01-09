import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly paypalService;
    constructor(paymentsService: PaymentsService, paypalService: PayPalService);
    create(createPaymentDto: CreatePaymentDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        subscriptionId: number;
        amount: string;
        currency: string;
        paymentMethod: string;
        transactionId: string;
        invoiceNumber: string;
        invoiceUrl: string;
        paymentDate: Date;
    }>;
    getMyPayments(user: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        subscriptionId: number;
        amount: string;
        currency: string;
        paymentMethod: string;
        transactionId: string;
        invoiceNumber: string;
        invoiceUrl: string;
        paymentDate: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        statusId: number;
        userId: number;
        subscriptionId: number;
        amount: string;
        currency: string;
        paymentMethod: string;
        transactionId: string;
        invoiceNumber: string;
        invoiceUrl: string;
        paymentDate: Date;
    }>;
    generateInvoice(id: number): Promise<{
        invoiceNumber: string;
        paymentId: number;
        amount: string;
        currency: string;
        statusId: number;
        paymentDate: Date;
        downloadUrl: string;
    }>;
    createOrder(body: {
        amount: string;
        currency?: string;
    }): Promise<any>;
    captureOrder(body: {
        orderId: string;
    }, user: any): Promise<{
        result: any;
        payment: {
            id: number;
            uuid: string;
            isDeleted: boolean;
            createdAt: Date;
            deletedAt: Date;
            statusId: number;
            userId: number;
            subscriptionId: number;
            amount: string;
            currency: string;
            paymentMethod: string;
            transactionId: string;
            invoiceNumber: string;
            invoiceUrl: string;
            paymentDate: Date;
        };
    }>;
    createSubscription(body: {
        planId: string;
    }, user: any): Promise<void>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<{
        id: number;
        uuid: string;
        subscriptionId: number;
        userId: number;
        amount: string;
        currency: string;
        paymentMethod: string;
        transactionId: string;
        invoiceNumber: string;
        invoiceUrl: string;
        statusId: number;
        paymentDate: Date;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
    }>;
}
//# sourceMappingURL=payments.controller.d.ts.map