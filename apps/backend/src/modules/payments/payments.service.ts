import { Injectable, Inject } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { eq, and } from 'drizzle-orm';
import { paymentHistory } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class PaymentsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreatePaymentDto) {
    // Mock PayPal payment processing
    const transactionId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = `INV-${Date.now()}`;
    
    const [payment] = await this.db.insert(paymentHistory).values({
      ...dto,
      transactionId: transactionId,
      invoiceNumber: invoiceNumber,
      paymentDate: new Date(),
    } as any).returning();
    
    return payment;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(paymentHistory).where(
      and(eq(paymentHistory.userId, userId), eq(paymentHistory.isDeleted, false))
    );
  }

  async findOne(id: number) {
    const [payment] = await this.db.select().from(paymentHistory).where(
      and(eq(paymentHistory.id, id), eq(paymentHistory.isDeleted, false))
    ).limit(1);
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(paymentHistory).set(dto as any).where(eq(paymentHistory.id, id)).returning();
    return updated;
  }

  async generateInvoice(paymentId: number) {
    const payment = await this.findOne(paymentId);
    // Mock invoice generation - in production, use PDFKit or Puppeteer
    return {
      invoiceNumber: payment.invoiceNumber,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      statusId: payment.statusId,
      paymentDate: payment.paymentDate,
      downloadUrl: `/api/invoices/${payment.invoiceNumber}.pdf`,
    };
  }
}
