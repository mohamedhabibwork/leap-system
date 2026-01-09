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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let GroupsService = class GroupsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [group] = await this.db.insert(database_1.groups).values(dto).returning();
        return group;
    }
    async findAll() {
        return await this.db.select().from(database_1.groups).where((0, drizzle_orm_1.eq)(database_1.groups.isDeleted, false));
    }
    async findOne(id) {
        const [group] = await this.db.select().from(database_1.groups).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.groups.id, id), (0, drizzle_orm_1.eq)(database_1.groups.isDeleted, false))).limit(1);
        if (!group)
            throw new Error('Group not found');
        return group;
    }
    async update(id, dto, userId) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.groups).set(dto).where((0, drizzle_orm_1.eq)(database_1.groups.id, id)).returning();
        return updated;
    }
    async remove(id, userId) {
        await this.db.update(database_1.groups).set({ isDeleted: true, deletedAt: new Date() }).where((0, drizzle_orm_1.eq)(database_1.groups.id, id));
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, privacyTypeId } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.groups.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(database_1.groups.name, `%${search}%`));
        }
        if (privacyTypeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.groups.privacyTypeId, privacyTypeId));
        }
        const results = await this.db
            .select()
            .from(database_1.groups)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.groups.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.groups)
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
            public: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.groups.privacyTypeId} = 1)`,
            private: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.groups.privacyTypeId} = 2)`,
        })
            .from(database_1.groups)
            .where((0, drizzle_orm_1.eq)(database_1.groups.isDeleted, false));
        return {
            total: Number(stats.total),
            public: Number(stats.public),
            private: Number(stats.private),
        };
    }
    async joinGroup(groupId, userId) {
        return { success: true, message: 'Joined group successfully' };
    }
    async leaveGroup(groupId, userId) {
        return { success: true, message: 'Left group successfully' };
    }
    async getMembers(groupId, query) {
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
    async addMember(groupId, userId) {
        return { success: true, message: 'Member added successfully' };
    }
    async approveGroup(id) {
        return { success: true, message: 'Group approved' };
    }
    async rejectGroup(id) {
        return { success: true, message: 'Group rejected' };
    }
    async setFeatured(id, featured) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.groups)
            .set({ isFeatured: featured })
            .where((0, drizzle_orm_1.eq)(database_1.groups.id, id))
            .returning();
        return updated;
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'delete':
                await this.db
                    .update(database_1.groups)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.groups.id} = ANY(${ids})`);
                return { message: `Deleted ${ids.length} groups` };
            case 'activate':
                return { message: `Activated ${ids.length} groups` };
            case 'deactivate':
                return { message: `Deactivated ${ids.length} groups` };
            default:
                throw new Error('Invalid operation');
        }
    }
    async exportToCsv(query) {
        const { search, statusId } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.groups.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(database_1.groups.name, `%${search}%`));
        }
        if (statusId) {
        }
        const results = await this.db
            .select()
            .from(database_1.groups)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.groups.createdAt));
        const headers = ['ID', 'Name', 'Privacy Type', 'Member Count', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const group of results) {
            const row = [
                group.id,
                `"${group.name?.replace(/"/g, '""') || ''}"`,
                group.privacyTypeId,
                group.memberCount || 0,
                group.createdAt?.toISOString() || '',
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], GroupsService);
//# sourceMappingURL=groups.service.js.map