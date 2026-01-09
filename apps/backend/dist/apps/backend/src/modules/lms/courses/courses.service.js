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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let CoursesService = class CoursesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createCourseDto) {
        const [course] = await this.db.insert(database_1.courses).values(createCourseDto).returning();
        return course;
    }
    async findAll(page = 1, limit = 10, sort) {
        const offset = (page - 1) * limit;
        const results = await this.db
            .select()
            .from(database_1.courses)
            .where((0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false))
            .orderBy((0, drizzle_orm_1.desc)(database_1.courses.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false));
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
    async findPublished() {
        return await this.db.select().from(database_1.courses).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
    }
    async findOne(id) {
        const [course] = await this.db.select().from(database_1.courses).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.id, id), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false))).limit(1);
        if (!course)
            throw new common_1.NotFoundException(`Course with ID ${id} not found`);
        return course;
    }
    async update(id, updateCourseDto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.courses).set(updateCourseDto).where((0, drizzle_orm_1.eq)(database_1.courses.id, id)).returning();
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.update(database_1.courses).set({
            isDeleted: true,
        }).where((0, drizzle_orm_1.eq)(database_1.courses.id, id));
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], CoursesService);
//# sourceMappingURL=courses.service.js.map