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
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, statusId, startDate, endDate } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.events.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.events.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.events.titleAr, `%${search}%`), (0, drizzle_orm_1.like)(database_1.events.location, `%${search}%`)));
        }
        if (statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.events.statusId, statusId));
        }
        if (startDate) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.events.startDate, new Date(startDate)));
        }
        if (endDate) {
            conditions.push((0, drizzle_orm_1.lte)(database_1.events.endDate, new Date(endDate)));
        }
        const results = await this.db
            .select()
            .from(database_1.events)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.events.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.events)
            .where((0, drizzle_orm_1.and)(...conditions));
        return {
            data: results,
            pagination: {
                page,
                limit,
                total: Number(count),
                totalPages: Math.ceil(Number(count) / limit),
            },
        };
    }
    async getStatistics() {
        const [stats] = await this.db
            .select({
            total: (0, drizzle_orm_1.sql) `count(*)`,
            upcoming: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.events.startDate} > now())`,
            ongoing: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.events.startDate} <= now() and ${database_1.events.endDate} >= now())`,
            past: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.events.endDate} < now())`,
        })
            .from(database_1.events)
            .where((0, drizzle_orm_1.eq)(database_1.events.isDeleted, false));
        return {
            total: Number(stats.total),
            upcoming: Number(stats.upcoming),
            ongoing: Number(stats.ongoing),
            past: Number(stats.past),
        };
    }
    async findOne(id) {
        const [event] = await this.db.select().from(database_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.events.id, id), (0, drizzle_orm_1.eq)(database_1.events.isDeleted, false))).limit(1);
        if (!event)
            throw new Error('Event not found');
        return event;
    }
    async registerForEvent(eventId, userId) {
        return { success: true, message: 'Registered for event successfully' };
    }
    async getRegistrations(eventId, query) {
        return {
            data: [],
            pagination: {
                page: query.page || 1,
                limit: query.limit || 10,
                total: 0,
                totalPages: 0,
            },
        };
    }
    async setFeatured(id, featured) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.events)
            .set({ isFeatured: featured })
            .where((0, drizzle_orm_1.eq)(database_1.events.id, id))
            .returning();
        return updated;
    }
    async update(id, dto, userId) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.events).set(dto).where((0, drizzle_orm_1.eq)(database_1.events.id, id)).returning();
        return updated;
    }
    async remove(id, userId) {
        await this.db.update(database_1.events).set({ isDeleted: true, deletedAt: new Date() }).where((0, drizzle_orm_1.eq)(database_1.events.id, id));
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'delete':
                await this.db
                    .update(database_1.events)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.events.id} = ANY(${ids})`);
                return { message: `Deleted ${ids.length} events` };
            case 'activate':
                await this.db
                    .update(database_1.events)
                    .set({ statusId: 1 })
                    .where((0, drizzle_orm_1.sql) `${database_1.events.id} = ANY(${ids})`);
                return { message: `Activated ${ids.length} events` };
            case 'deactivate':
                await this.db
                    .update(database_1.events)
                    .set({ statusId: 2 })
                    .where((0, drizzle_orm_1.sql) `${database_1.events.id} = ANY(${ids})`);
                return { message: `Deactivated ${ids.length} events` };
            default:
                throw new Error('Invalid operation');
        }
    }
    async exportToCsv(query) {
        const { search, statusId, startDate, endDate } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.events.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.events.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.events.titleAr, `%${search}%`), (0, drizzle_orm_1.like)(database_1.events.location, `%${search}%`)));
        }
        if (statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.events.statusId, statusId));
        }
        if (startDate) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.events.startDate, new Date(startDate)));
        }
        if (endDate) {
            conditions.push((0, drizzle_orm_1.lte)(database_1.events.endDate, new Date(endDate)));
        }
        const results = await this.db
            .select()
            .from(database_1.events)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.events.createdAt));
        const headers = ['ID', 'Title (EN)', 'Title (AR)', 'Location', 'Start Date', 'End Date', 'Status', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const event of results) {
            const row = [
                event.id,
                `"${event.titleEn?.replace(/"/g, '""') || ''}"`,
                `"${event.titleAr?.replace(/"/g, '""') || ''}"`,
                `"${event.location?.replace(/"/g, '""') || ''}"`,
                event.startDate?.toISOString() || '',
                event.endDate?.toISOString() || '',
                event.statusId,
                event.createdAt?.toISOString() || '',
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], EventsService);
//# sourceMappingURL=events.service.js.map