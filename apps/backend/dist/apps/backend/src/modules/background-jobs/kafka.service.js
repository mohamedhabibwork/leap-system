"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
let KafkaService = KafkaService_1 = class KafkaService {
    logger = new common_1.Logger(KafkaService_1.name);
    async onModuleInit() {
        this.logger.log('Kafka service initialized (mock mode)');
    }
    async publishEvent(topic, event) {
        this.logger.log(`[MOCK] Publishing to topic ${topic}: ${JSON.stringify(event)}`);
        return true;
    }
    async publishAuditLog(action, userId, metadata) {
        return this.publishEvent('audit-events', { action, userId, metadata, timestamp: new Date() });
    }
    async publishCourseEvent(eventType, courseId, data) {
        return this.publishEvent('lms-events', { eventType, courseId, data, timestamp: new Date() });
    }
    async publishSocialEvent(eventType, entityType, entityId, data) {
        return this.publishEvent('social-events', { eventType, entityType, entityId, data, timestamp: new Date() });
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)()
], KafkaService);
//# sourceMappingURL=kafka.service.js.map