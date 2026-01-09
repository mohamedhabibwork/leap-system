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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const paypal_service_1 = require("./paypal.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    paypalService;
    constructor(paymentsService, paypalService) {
        this.paymentsService = paymentsService;
        this.paypalService = paypalService;
    }
    create(createPaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }
    getMyPayments(user) {
        return this.paymentsService.findByUser(user.userId);
    }
    findOne(id) {
        return this.paymentsService.findOne(id);
    }
    generateInvoice(id) {
        return this.paymentsService.generateInvoice(id);
    }
    async createOrder(body) {
        return this.paypalService.createOrder(body.amount, body.currency);
    }
    async captureOrder(body, user) {
        const result = await this.paypalService.captureOrder(body.orderId);
        const payment = await this.paymentsService.create({
            userId: user.userId,
            amount: parseFloat(result.purchase_units[0].amount.value),
            currency: result.purchase_units[0].amount.currency_code,
            paymentMethod: 'paypal',
            status: 'completed',
            transactionId: result.id,
        });
        return { result, payment };
    }
    async createSubscription(body, user) {
        return this.paypalService.createSubscription(body.planId, user.userId.toString());
    }
    async cancelSubscription(subscriptionId) {
        return this.paypalService.cancelSubscription(subscriptionId);
    }
    update(id, updatePaymentDto) {
        return this.paymentsService.update(id, updatePaymentDto);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Process payment (mock PayPal)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user payment history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/invoice'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate/download invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Post)('create-order'),
    (0, swagger_1.ApiOperation)({ summary: 'Create PayPal order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('capture-order'),
    (0, swagger_1.ApiOperation)({ summary: 'Capture PayPal order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "captureOrder", null);
__decorate([
    (0, common_1.Post)('create-subscription'),
    (0, swagger_1.ApiOperation)({ summary: 'Create PayPal subscription' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('cancel-subscription/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel PayPal subscription' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update payment (Admin only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "update", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        paypal_service_1.PayPalService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map