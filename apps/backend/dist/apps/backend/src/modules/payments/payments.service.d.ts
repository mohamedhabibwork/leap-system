import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class PaymentsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreatePaymentDto): Promise<{
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
    findByUser(userId: number): Promise<{
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
    update(id: number, dto: UpdatePaymentDto): Promise<{
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
    generateInvoice(paymentId: number): Promise<{
        invoiceNumber: string;
        paymentId: number;
        amount: string;
        currency: string;
        statusId: number;
        paymentDate: Date;
        downloadUrl: string;
    }>;
}
//# sourceMappingURL=payments.service.d.ts.map