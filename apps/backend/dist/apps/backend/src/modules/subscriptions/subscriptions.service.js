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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let SubscriptionsService = class SubscriptionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createSubscriptionDto) {
        const [subscription] = await this.db
            .insert(database_1.subscriptions)
            .values(createSubscriptionDto)
            .returning();
        return subscription;
    }
    async findAll() {
        return await this.db
            .select()
            .from(database_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(database_1.subscriptions.isDeleted, false));
    }
    async findOne(id) {
        const [subscription] = await this.db
            .select()
            .from(database_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.subscriptions.id, id), (0, drizzle_orm_1.eq)(database_1.subscriptions.isDeleted, false)))
            .limit(1);
        if (!subscription) {
            throw new common_1.NotFoundException(`Subscription with ID ${id} not found`);
        }
        return subscription;
    }
    async findByUser(userId) {
        return await this.db
            .select()
            .from(database_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.subscriptions.userId, userId), (0, drizzle_orm_1.eq)(database_1.subscriptions.isDeleted, false)));
    }
    async findActiveByUser(userId) {
        const [subscription] = await this.db
            .select()
            .from(database_1.subscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.subscriptions.userId, userId), (0, drizzle_orm_1.eq)(database_1.subscriptions.statusId, 1), (0, drizzle_orm_1.eq)(database_1.subscriptions.isDeleted, false), (0, drizzle_orm_1.gte)(database_1.subscriptions.endDate, new Date())))
            .limit(1);
        return (subscription || null);
    }
    async update(id, updateSubscriptionDto) {
        await this.findOne(id);
        const [updatedSubscription] = await this.db
            .update(database_1.subscriptions)
            .set(updateSubscriptionDto)
            .where((0, drizzle_orm_1.eq)(database_1.subscriptions.id, id))
            .returning();
        return updatedSubscription;
    }
    async cancel(id) {
        await this.findOne(id);
        const [cancelledSubscription] = await this.db
            .update(database_1.subscriptions)
            .set({
            cancelledAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.subscriptions.id, id))
            .returning();
        return cancelledSubscription;
    }
    async renew(id, endDate) {
        await this.findOne(id);
        const [renewedSubscription] = await this.db
            .update(database_1.subscriptions)
            .set({
            endDate: new Date(endDate),
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.subscriptions.id, id))
            .returning();
        return renewedSubscription;
    }
    async remove(id) {
        await this.findOne(id);
        await this.db
            .update(database_1.subscriptions)
            .set({
            isDeleted: true,
            deletedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(database_1.subscriptions.id, id));
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map