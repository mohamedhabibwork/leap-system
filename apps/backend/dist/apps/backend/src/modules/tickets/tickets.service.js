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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const bulk_operation_dto_1 = require("./dto/bulk-operation.dto");
let TicketsService = class TicketsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const [ticket] = await this.db
            .insert(database_1.tickets)
            .values({ ...dto, ticketNumber })
            .returning();
        return ticket;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', status, priority, category, assignedTo, userId, dateFrom, dateTo, } = query;
        const offset = (page - 1) * limit;
        let conditions = [(0, drizzle_orm_1.eq)(database_1.tickets.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.tickets.ticketNumber, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.tickets.subject, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.tickets.description, `%${search}%`)));
        }
        if (status)
            conditions.push((0, drizzle_orm_1.eq)(database_1.tickets.statusId, status));
        if (priority)
            conditions.push((0, drizzle_orm_1.eq)(database_1.tickets.priorityId, priority));
        if (category)
            conditions.push((0, drizzle_orm_1.eq)(database_1.tickets.categoryId, category));
        if (assignedTo)
            conditions.push((0, drizzle_orm_1.eq)(database_1.tickets.assignedTo, assignedTo));
        if (userId)
            conditions.push((0, drizzle_orm_1.eq)(database_1.tickets.userId, userId));
        const whereClause = (0, drizzle_orm_1.and)(...conditions);
        const orderByClause = sortOrder === 'asc' ? (0, drizzle_orm_1.asc)(database_1.tickets[sortBy]) : (0, drizzle_orm_1.desc)(database_1.tickets[sortBy]);
        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(database_1.tickets)
                .where(whereClause)
                .orderBy(orderByClause)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(database_1.tickets)
                .where(whereClause),
        ]);
        const total = Number(countResult[0]?.count || 0);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const [ticket] = await this.db
            .select()
            .from(database_1.tickets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.tickets.id, id), (0, drizzle_orm_1.eq)(database_1.tickets.isDeleted, false)))
            .limit(1);
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async update(id, dto) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.tickets)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.tickets.id, id))
            .returning();
        return updated;
    }
    async remove(id) {
        await this.db
            .update(database_1.tickets)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.tickets.id, id));
        return { success: true };
    }
    async assignTicket(id, assignToId) {
        const [updated] = await this.db
            .update(database_1.tickets)
            .set({ assignedTo: assignToId, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.tickets.id, id))
            .returning();
        return updated;
    }
    async getReplies(ticketId) {
        return await this.db
            .select()
            .from(database_1.ticketReplies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.ticketReplies.ticketId, ticketId), (0, drizzle_orm_1.eq)(database_1.ticketReplies.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.asc)(database_1.ticketReplies.createdAt));
    }
    async addReply(ticketId, dto) {
        await this.findOne(ticketId);
        const [reply] = await this.db
            .insert(database_1.ticketReplies)
            .values({ ...dto, ticketId })
            .returning();
        return reply;
    }
    async getStatistics() {
        const [stats] = await this.db
            .select({
            total: (0, drizzle_orm_1.sql) `count(*)`,
            open: (0, drizzle_orm_1.sql) `count(*) filter (where status_id = 1)`,
            pending: (0, drizzle_orm_1.sql) `count(*) filter (where status_id = 2)`,
            resolved: (0, drizzle_orm_1.sql) `count(*) filter (where status_id = 3)`,
            closed: (0, drizzle_orm_1.sql) `count(*) filter (where status_id = 4)`,
        })
            .from(database_1.tickets)
            .where((0, drizzle_orm_1.eq)(database_1.tickets.isDeleted, false));
        return stats;
    }
    async bulkOperation(dto) {
        const { ids, action, assignToId, statusId, priorityId } = dto;
        let processedCount = 0;
        const errors = [];
        for (const id of ids) {
            try {
                switch (action) {
                    case bulk_operation_dto_1.TicketBulkAction.DELETE:
                        await this.remove(id);
                        break;
                    case bulk_operation_dto_1.TicketBulkAction.CLOSE:
                        await this.update(id, { closedAt: new Date() });
                        break;
                    case bulk_operation_dto_1.TicketBulkAction.ASSIGN:
                        if (assignToId)
                            await this.assignTicket(id, assignToId);
                        break;
                    case bulk_operation_dto_1.TicketBulkAction.CHANGE_STATUS:
                        if (statusId)
                            await this.update(id, { statusId });
                        break;
                    case bulk_operation_dto_1.TicketBulkAction.CHANGE_PRIORITY:
                        if (priorityId)
                            await this.update(id, { priorityId });
                        break;
                }
                processedCount++;
            }
            catch (error) {
                errors.push({ id, error: error.message });
            }
        }
        return {
            success: true,
            processedCount,
            failedCount: errors.length,
            errors,
        };
    }
    async exportToCsv(query) {
        const result = await this.findAllAdmin({ ...query, limit: 10000 });
        return { data: result.data, format: 'csv' };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map