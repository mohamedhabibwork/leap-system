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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let NotificationsService = class NotificationsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [notification] = await this.db.insert(database_1.notifications).values({
            ...dto,
            isRead: false,
        }).returning();
        await this.deliverNotification(notification);
        return notification;
    }
    async deliverNotification(notification) {
        console.log(`[NOTIFICATION] Sent to user ${notification.userId}: ${notification.title}`);
    }
    async findByUser(userId) {
        return await this.db.select().from(database_1.notifications).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(database_1.notifications.isDeleted, false))).orderBy((0, drizzle_orm_1.sql) `${database_1.notifications.createdAt} DESC`);
    }
    async findUnread(userId) {
        return await this.db.select().from(database_1.notifications).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(database_1.notifications.isRead, false), (0, drizzle_orm_1.eq)(database_1.notifications.isDeleted, false)));
    }
    async markAsRead(id) {
        await this.db.update(database_1.notifications).set({ isRead: true }).where((0, drizzle_orm_1.eq)(database_1.notifications.id, id));
    }
    async markAllAsRead(userId) {
        await this.db.update(database_1.notifications).set({ isRead: true }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(database_1.notifications.isRead, false)));
    }
    async remove(id) {
        await this.db.update(database_1.notifications).set({ isDeleted: true }).where((0, drizzle_orm_1.eq)(database_1.notifications.id, id));
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map