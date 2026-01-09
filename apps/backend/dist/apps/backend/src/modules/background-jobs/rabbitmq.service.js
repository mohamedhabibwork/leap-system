"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMQService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
let RabbitMQService = RabbitMQService_1 = class RabbitMQService {
    connection;
    channel;
    logger = new common_1.Logger(RabbitMQService_1.name);
    async onModuleInit() {
        try {
            this.logger.log('RabbitMQ service initialized (mock mode)');
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
        }
    }
    async sendToQueue(queue, message) {
        this.logger.log(`[MOCK] Sending to queue ${queue}: ${JSON.stringify(message)}`);
        return true;
    }
    async sendEmail(to, subject, body) {
        return this.sendToQueue('email-queue', { to, subject, body });
    }
    async generateInvoice(paymentId) {
        return this.sendToQueue('invoice-queue', { paymentId });
    }
    async generateCertificate(enrollmentId) {
        return this.sendToQueue('certificate-queue', { enrollmentId });
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = RabbitMQService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map