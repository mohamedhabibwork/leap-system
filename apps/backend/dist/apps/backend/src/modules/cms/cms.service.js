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
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let CmsService = class CmsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [page] = await this.db.insert(database_1.cmsPages).values(dto).returning();
        return page;
    }
    async findAll() {
        return await this.db.select().from(database_1.cmsPages).where((0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false));
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, isPublished } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.cmsPages.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.cmsPages.titleAr, `%${search}%`), (0, drizzle_orm_1.like)(database_1.cmsPages.slug, `%${search}%`)));
        }
        if (isPublished !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.cmsPages.isPublished, isPublished));
        }
        const results = await this.db
            .select()
            .from(database_1.cmsPages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.cmsPages.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.cmsPages)
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
            published: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.cmsPages.isPublished} = true)`,
            draft: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.cmsPages.isPublished} = false)`,
        })
            .from(database_1.cmsPages)
            .where((0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false));
        return {
            total: Number(stats.total),
            published: Number(stats.published),
            draft: Number(stats.draft),
        };
    }
    async findOne(id) {
        const [page] = await this.db.select().from(database_1.cmsPages).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.cmsPages.id, id), (0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false))).limit(1);
        if (!page)
            throw new Error('Page not found');
        return page;
    }
    async findBySlug(slug) {
        const [page] = await this.db
            .select()
            .from(database_1.cmsPages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.cmsPages.slug, slug), (0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.cmsPages.isPublished, true)))
            .limit(1);
        if (!page)
            throw new Error('Page not found');
        return page;
    }
    async publish(id) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.cmsPages)
            .set({ isPublished: true, publishedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.cmsPages.id, id))
            .returning();
        return updated;
    }
    async unpublish(id) {
        await this.findOne(id);
        const [updated] = await this.db
            .update(database_1.cmsPages)
            .set({ isPublished: false })
            .where((0, drizzle_orm_1.eq)(database_1.cmsPages.id, id))
            .returning();
        return updated;
    }
    async update(id, dto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.cmsPages).set(dto).where((0, drizzle_orm_1.eq)(database_1.cmsPages.id, id)).returning();
        return updated;
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'publish':
                await this.db
                    .update(database_1.cmsPages)
                    .set({ isPublished: true, publishedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.cmsPages.id} = ANY(${ids})`);
                break;
            case 'unpublish':
                await this.db
                    .update(database_1.cmsPages)
                    .set({ isPublished: false })
                    .where((0, drizzle_orm_1.sql) `${database_1.cmsPages.id} = ANY(${ids})`);
                break;
            case 'delete':
                await this.db
                    .update(database_1.cmsPages)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.cmsPages.id} = ANY(${ids})`);
                break;
        }
        return { success: true, message: `${operation} completed for ${ids.length} pages` };
    }
    async exportToCsv(query) {
        const { search, isPublished } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.cmsPages.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.cmsPages.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.cmsPages.titleAr, `%${search}%`), (0, drizzle_orm_1.like)(database_1.cmsPages.slug, `%${search}%`)));
        }
        if (isPublished !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.cmsPages.isPublished, isPublished));
        }
        const results = await this.db
            .select()
            .from(database_1.cmsPages)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.cmsPages.createdAt));
        return results;
    }
    async remove(id) {
        await this.db.update(database_1.cmsPages).set({ isDeleted: true }).where((0, drizzle_orm_1.eq)(database_1.cmsPages.id, id));
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], CmsService);
//# sourceMappingURL=cms.service.js.map