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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let JobsService = class JobsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        const [job] = await this.db.insert(database_1.jobs).values(dto).returning();
        return job;
    }
    async findAll() {
        return await this.db.select().from(database_1.jobs).where((0, drizzle_orm_1.eq)(database_1.jobs.isDeleted, false));
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 10, search, statusId, jobTypeId } = query;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.jobs.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.jobs.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.jobs.titleAr, `%${search}%`)));
        }
        if (statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.jobs.statusId, statusId));
        }
        if (jobTypeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.jobs.jobTypeId, jobTypeId));
        }
        const results = await this.db
            .select()
            .from(database_1.jobs)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.jobs.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.jobs)
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
            active: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.jobs.statusId} = 1)`,
            closed: (0, drizzle_orm_1.sql) `count(*) filter (where ${database_1.jobs.statusId} = 2)`,
        })
            .from(database_1.jobs)
            .where((0, drizzle_orm_1.eq)(database_1.jobs.isDeleted, false));
        return {
            total: Number(stats.total),
            active: Number(stats.active),
            closed: Number(stats.closed),
        };
    }
    async findOne(id) {
        const [job] = await this.db.select().from(database_1.jobs).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.jobs.id, id), (0, drizzle_orm_1.eq)(database_1.jobs.isDeleted, false))).limit(1);
        if (!job)
            throw new Error('Job not found');
        return job;
    }
    async applyForJob(jobId, userId, applicationData) {
        return { success: true, message: 'Applied for job successfully' };
    }
    async getApplications(jobId, query) {
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
            .update(database_1.jobs)
            .set({ isFeatured: featured })
            .where((0, drizzle_orm_1.eq)(database_1.jobs.id, id))
            .returning();
        return updated;
    }
    async update(id, dto, userId) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.jobs).set(dto).where((0, drizzle_orm_1.eq)(database_1.jobs.id, id)).returning();
        return updated;
    }
    async remove(id, userId) {
        await this.db.update(database_1.jobs).set({ isDeleted: true, deletedAt: new Date() }).where((0, drizzle_orm_1.eq)(database_1.jobs.id, id));
    }
    async bulkOperation(dto) {
        const { operation, ids } = dto;
        switch (operation) {
            case 'delete':
                await this.db
                    .update(database_1.jobs)
                    .set({ isDeleted: true, deletedAt: new Date() })
                    .where((0, drizzle_orm_1.sql) `${database_1.jobs.id} = ANY(${ids})`);
                return { message: `Deleted ${ids.length} jobs` };
            case 'activate':
                await this.db
                    .update(database_1.jobs)
                    .set({ statusId: 1 })
                    .where((0, drizzle_orm_1.sql) `${database_1.jobs.id} = ANY(${ids})`);
                return { message: `Activated ${ids.length} jobs` };
            case 'deactivate':
                await this.db
                    .update(database_1.jobs)
                    .set({ statusId: 2 })
                    .where((0, drizzle_orm_1.sql) `${database_1.jobs.id} = ANY(${ids})`);
                return { message: `Deactivated ${ids.length} jobs` };
            default:
                throw new Error('Invalid operation');
        }
    }
    async exportToCsv(query) {
        const { search, statusId, jobTypeId } = query;
        const conditions = [(0, drizzle_orm_1.eq)(database_1.jobs.isDeleted, false)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(database_1.jobs.titleEn, `%${search}%`), (0, drizzle_orm_1.like)(database_1.jobs.titleAr, `%${search}%`)));
        }
        if (statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.jobs.statusId, statusId));
        }
        if (jobTypeId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.jobs.jobTypeId, jobTypeId));
        }
        const results = await this.db
            .select()
            .from(database_1.jobs)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.jobs.createdAt));
        const headers = ['ID', 'Title (EN)', 'Title (AR)', 'Location', 'Status', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const job of results) {
            const row = [
                job.id,
                `"${job.titleEn?.replace(/"/g, '""') || ''}"`,
                `"${job.titleAr?.replace(/"/g, '""') || ''}"`,
                `"${job.location?.replace(/"/g, '""') || ''}"`,
                job.statusId,
                job.createdAt?.toISOString() || '',
            ];
            csvRows.push(row.join(','));
        }
        return csvRows.join('\n');
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], JobsService);
//# sourceMappingURL=jobs.service.js.map