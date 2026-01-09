import { ConfigService } from '@nestjs/config';
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private verifyConnection;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName?: string): Promise<boolean>;
    private getVerificationEmailTemplate;
    private getPasswordResetEmailTemplate;
    private getWelcomeEmailTemplate;
}
export {};
//# sourceMappingURL=email.service.d.ts.map