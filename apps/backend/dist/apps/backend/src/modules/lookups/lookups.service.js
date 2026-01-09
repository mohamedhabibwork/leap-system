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
exports.LookupsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const database_1 = require("@leap-lms/database");
const drizzle_orm_1 = require("drizzle-orm");
let LookupsService = class LookupsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        return this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false))
            .orderBy(database_1.lookups.displayOrder, database_1.lookups.sortOrder);
    }
    async findByType(typeCode, query) {
        const [type] = await this.db
            .select()
            .from(database_1.lookupTypes)
            .where((0, drizzle_orm_1.eq)(database_1.lookupTypes.code, typeCode))
            .limit(1);
        if (!type) {
            throw new common_1.NotFoundException(`Lookup type ${typeCode} not found`);
        }
        const conditions = [
            (0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, type.id),
            (0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false),
            (0, drizzle_orm_1.eq)(database_1.lookups.isActive, true)
        ];
        if (query?.search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.lookups.nameEn, `%${query.search}%`), (0, drizzle_orm_1.like)(database_1.lookups.nameAr, `%${query.search}%`)));
        }
        return this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(database_1.lookups.displayOrder, database_1.lookups.sortOrder);
    }
    async findOne(id) {
        const [lookup] = await this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lookups.id, id), (0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false)))
            .limit(1);
        if (!lookup) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return lookup;
    }
    async create(data) {
        const [lookup] = await this.db
            .insert(database_1.lookups)
            .values({
            ...data,
            isActive: data.isActive ?? true,
            isDeleted: false,
        })
            .returning();
        return lookup;
    }
    async update(id, data) {
        const [updated] = await this.db
            .update(database_1.lookups)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookups.id, id))
            .returning();
        if (!updated) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return updated;
    }
    async remove(id) {
        const [deleted] = await this.db
            .update(database_1.lookups)
            .set({
            isDeleted: true,
            deletedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.lookups.id, id))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Lookup with ID ${id} not found`);
        }
        return { message: 'Lookup deleted successfully' };
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, typeId } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.lookups.nameEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.lookups.nameAr, `%${search}%`)));
        }
        if (typeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, typeId));
        }
        const results = await this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.lookups.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.lookups)
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
            active: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.lookups.isActive} = true)`,
            inactive: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.lookups.isActive} = false)`,
        })
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false));
        return {
            total: Number(stats.total),
            active: Number(stats.active),
            inactive: Number(stats.inactive),
        };
    }
    async reorder(dto) {
        const { items } = dto;
        for (const item of items) {
            await this.db
                .update(database_1.lookups)
                .set({ displayOrder: item.order })
                .where((0, drizzle_orm_1.eq)(database_1.lookups.id, item.id));
        }
        return { message: 'Lookups reordered successfully' };
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'delete':
                await this.db
                    .update(database_1.lookups)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.lookups.id} = ANY(${ids})`);
                return { message: `Deleted ${ids.length} lookups` };
            case 'activate':
                await this.db
                    .update(database_1.lookups)
                    .set({ isActive: true })
                    .where((0, drizzle_orm_1.sql) `${database_1.lookups.id} = ANY(${ids})`);
                return { message: `Activated ${ids.length} lookups` };
            case 'deactivate':
                await this.db
                    .update(database_1.lookups)
                    .set({ isActive: false })
                    .where((0, drizzle_orm_1.sql) `${database_1.lookups.id} = ANY(${ids})`);
                return { message: `Deactivated ${ids.length} lookups` };
            default:
                throw new Error('Invalid operation');
        }
    }
    async exportToCsv(query) {
        const { search, typeId } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.lookups.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.lookups.nameEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.lookups.nameAr, `%${search}%`)));
        }
        if (typeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.lookups.lookupTypeId, typeId));
        }
        const results = await this.db
            .select()
            .from(database_1.lookups)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.lookups.createdAt));
        const headers = ['ID', 'Name (EN)', 'Name (AR)', 'Type ID', 'Active', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const lookup of results) {
            const row = [
                lookup.id,
                `"${lookup.nameEn?.replace(/"/g, '""') || ''}"`,
                `"${lookup.nameAr?.replace(/"/g, '""') || ''}"`,
                lookup.lookupTypeId,
                lookup.isActive,
                lookup.createdAt?.toISOString() || '',
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
};
exports.LookupsService = LookupsService;
exports.LookupsService = LookupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], LookupsService);
//# sourceMappingURL=lookups.service.js.map