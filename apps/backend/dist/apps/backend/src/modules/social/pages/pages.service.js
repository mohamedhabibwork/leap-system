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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const bulk_page_operation_dto_1 = require("./dto/bulk-page-operation.dto");
let PagesService = class PagesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [page] = await this.db.insert(database_1.pages).values(dto).returning();
        return page;
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const offset = (page - 1) * limit;
        let conditions = [(0, drizzle_orm_1.eq)(database_1.pages.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.pages.name, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.pages.description, `%${search}%`)));
        }
        if (query.categoryId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.pages.categoryId, query.categoryId));
        }
        if (query.createdBy) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.pages.createdBy, query.createdBy));
        }
        const whereClause = (0, drizzle_orm_1.and)(...conditions);
        const orderByClause = sortOrder === 'asc' ? (0, drizzle_orm_1.asc)(database_1.pages[sortBy]) : (0, drizzle_orm_1.desc)(database_1.pages[sortBy]);
        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(database_1.pages)
                .where(whereClause)
                .orderBy(orderByClause)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(database_1.pages)
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
        const [page] = await this.db
            .select()
            .from(database_1.pages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.pages.id, id), (0, drizzle_orm_1.eq)(database_1.pages.isDeleted, false)))
            .limit(1);
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return page;
    }
    async update(id, dto) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.pages)
            .set({ ...dto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.pages.id, id))
            .returning();
        return updated;
    }
    async remove(id) {
        await this.db
            .update(database_1.pages)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.pages.id, id));
        return { success: true };
    }
    async verifyPage(id, isVerified) {
        const [updated] = await this.db
            .update(database_1.pages)
            .set({ isVerified: isVerified, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.pages.id, id))
            .returning();
        return updated;
    }
    async setFeatured(id, isFeatured) {
        const [updated] = await this.db
            .update(database_1.pages)
            .set({ isFeatured: isFeatured, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.pages.id, id))
            .returning();
        return updated;
    }
    async getStatistics() {
        const [stats] = await this.db
            .select({
            total: (0, drizzle_orm_1.sql) `count(*)`,
            verified: (0, drizzle_orm_1.sql) `count(*) filter (where is_verified = true)`,
            featured: (0, drizzle_orm_1.sql) `count(*) filter (where is_featured = true)`,
        })
            .from(database_1.pages)
            .where((0, drizzle_orm_1.eq)(database_1.pages.isDeleted, false));
        return stats;
    }
    async bulkOperation(dto) {
        const { ids, action } = dto;
        let processedCount = 0;
        const errors = [];
        for (const id of ids) {
            try {
                switch (action) {
                    case bulk_page_operation_dto_1.PageBulkAction.DELETE:
                        await this.remove(id);
                        break;
                    case bulk_page_operation_dto_1.PageBulkAction.VERIFY:
                        await this.verifyPage(id, true);
                        break;
                    case bulk_page_operation_dto_1.PageBulkAction.UNVERIFY:
                        await this.verifyPage(id, false);
                        break;
                    case bulk_page_operation_dto_1.PageBulkAction.FEATURE:
                        await this.setFeatured(id, true);
                        break;
                    case bulk_page_operation_dto_1.PageBulkAction.UNFEATURE:
                        await this.setFeatured(id, false);
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
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], PagesService);
//# sourceMappingURL=pages.service.js.map