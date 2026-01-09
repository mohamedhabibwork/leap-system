import { OnModuleInit } from '@nestjs/common';
export declare class RabbitMQService implements OnModuleInit {
    private connection;
    private channel;
    private readonly logger;
    onModuleInit(): Promise<void>;
    sendToQueue(queue: string, message: any): Promise<boolean>;
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    generateInvoice(paymentId: number): Promise<boolean>;
    generateCertificate(enrollmentId: number): Promise<boolean>;
}
//# sourceMappingURL=rabbitmq.service.d.ts.map