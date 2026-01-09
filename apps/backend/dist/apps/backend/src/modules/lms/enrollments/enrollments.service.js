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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
const node_postgres_1 = require("drizzle-orm/node-postgres");
let EnrollmentsService = class EnrollmentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createEnrollmentDto) {
        const [enrollment] = await this.db.insert(database_1.enrollments).values(createEnrollmentDto).returning();
        return enrollment;
    }
    async findByUser(userId) {
        return await this.db.select().from(database_1.enrollments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.userId, userId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
    }
    async findByCourse(courseId) {
        return await this.db.select().from(database_1.enrollments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
    }
    async findOne(id) {
        const [enrollment] = await this.db.select().from(database_1.enrollments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.id, id), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false))).limit(1);
        if (!enrollment)
            throw new common_1.NotFoundException(`Enrollment with ID ${id} not found`);
        return enrollment;
    }
    async update(id, updateEnrollmentDto) {
        await this.findOne(id);
        const [updated] = await this.db.update(database_1.enrollments).set(updateEnrollmentDto).where((0, drizzle_orm_1.eq)(database_1.enrollments.id, id)).returning();
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.update(database_1.enrollments).set({
            isDeleted: true,
        }).where((0, drizzle_orm_1.eq)(database_1.enrollments.id, id));
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map