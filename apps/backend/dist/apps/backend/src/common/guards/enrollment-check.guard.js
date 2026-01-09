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
exports.EnrollmentCheckGuard = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let EnrollmentCheckGuard = class EnrollmentCheckGuard {
    db;
    constructor(db) {
        this.db = db;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const lessonId = parseInt(request.params.id || request.params.lessonId);
        if (!user || !lessonId) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const [lessonData] = await this.db
            .select({
            lessonId: database_1.lessons.id,
            isPreview: database_1.lessons.isPreview,
            courseId: database_1.courses.id,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lessons.id, lessonId), (0, drizzle_orm_1.eq)(database_1.lessons.isDeleted, false)))
            .limit(1);
        if (!lessonData) {
            throw new common_1.ForbiddenException('Lesson not found');
        }
        if (user.role === 'admin') {
            return true;
        }
        if (lessonData.instructorId === user.id) {
            return true;
        }
        if (lessonData.isPreview) {
            return true;
        }
        const [enrollment] = await this.db
            .select()
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.userId, user.id), (0, drizzle_orm_1.eq)(database_1.enrollments.courseId, lessonData.courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)))
            .limit(1);
        if (!enrollment) {
            throw new common_1.ForbiddenException('Enrollment required to access this lesson');
        }
        if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
            throw new common_1.ForbiddenException('Your enrollment has expired');
        }
        return true;
    }
};
exports.EnrollmentCheckGuard = EnrollmentCheckGuard;
exports.EnrollmentCheckGuard = EnrollmentCheckGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], EnrollmentCheckGuard);
//# sourceMappingURL=enrollment-check.guard.js.map