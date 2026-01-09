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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let EventsService = class EventsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [event] = await this.db.insert(database_1.events).values(dto).returning();
        return event;
    }
    async findAll() {
        return await this.db.select().from(database_1.events).where((0, drizzle_orm_1.eq)(database_1.events.isDeleted, false));
    }
    async findOne(id) {
        const [event] = await this.db.select().from(database_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.events.id, id), (0, drizzle_orm_1.eq)(database_1.events.isDeleted, false))).limit(1);
        if (!event)
            throw new Error('Event not found');
        return event;
    }
    async update(id, dto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.events).set(dto).where((0, drizzle_orm_1.eq)(database_1.events.id, id)).returning();
        return updated;
    }
    async remove(id) {
        await this.db.update(database_1.events).set({ isDeleted: true }).where((0, drizzle_orm_1.eq)(database_1.events.id, id));
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], EventsService);
//# sourceMappingURL=events.service.js.map