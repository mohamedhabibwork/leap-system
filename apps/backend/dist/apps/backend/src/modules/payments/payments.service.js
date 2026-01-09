"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let PaymentsService = class PaymentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const transactionId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const invoiceNumber = `INV-${Date.now()}`;
        const [payment] = await this.db.insert(database_1.paymentHistory).values({
            ...dto,
            transactionId: transactionId,
            invoiceNumber: invoiceNumber,
            paymentDate: new Date(),
        }).returning();
        return payment;
    }
    async findByUser(userId) {
        return await this.db.select().from(database_1.paymentHistory).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.paymentHistory.userId, userId), (0, drizzle_orm_1.eq)(database_1.paymentHistory.isDeleted, false)));
    }
    async findOne(id) {
        const [payment] = await this.db.select().from(database_1.paymentHistory).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.paymentHistory.id, id), (0, drizzle_orm_1.eq)(database_1.paymentHistory.isDeleted, false))).limit(1);
        if (!payment)
            throw new Error('Payment not found');
        return payment;
    }
    async update(id, dto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.paymentHistory).set(dto).where((0, drizzle_orm_1.eq)(database_1.paymentHistory.id, id)).returning();
        return updated;
    }
    async generateInvoice(paymentId) {
        const payment = await this.findOne(paymentId);
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map