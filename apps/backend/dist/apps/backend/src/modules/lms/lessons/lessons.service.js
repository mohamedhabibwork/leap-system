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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let LessonsService = class LessonsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findOne(lessonId) {
        const [lesson] = await this.db
            .select()
            .from(database_1.lessons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lessons.id, lessonId), (0, drizzle_orm_1.eq)(database_1.lessons.isDeleted, false)))
            .limit(1);
        if (!lesson) {
            throw new common_1.NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
        return lesson;
    }
    async checkLessonAccess(lessonId, userId, userRole) {
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
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (userRole === 'admin') {
            return { canAccess: true, reason: 'admin' };
        }
        if (lessonData.instructorId === userId) {
            return { canAccess: true, reason: 'instructor' };
        }
        if (lessonData.isPreview) {
            return { canAccess: true, reason: 'preview' };
        }
        const [enrollment] = await this.db
            .select({
            id: database_1.enrollments.id,
            enrollmentTypeId: database_1.enrollments.enrollmentTypeId,
            expiresAt: database_1.enrollments.expiresAt,
            enrolledAt: database_1.enrollments.enrolledAt,
            enrollmentTypeName: database_1.lookups.nameEn,
        })
            .from(database_1.enrollments)
            .leftJoin(database_1.lookups, (0, drizzle_orm_1.eq)(database_1.enrollments.enrollmentTypeId, database_1.lookups.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.userId, userId), (0, drizzle_orm_1.eq)(database_1.enrollments.courseId, lessonData.courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)))
            .limit(1);
        if (enrollment) {
            if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
                return {
                    canAccess: false,
                    reason: 'denied',
                    enrollment: {
                        ...enrollment,
                        isExpired: true,
                        daysRemaining: 0,
                    },
                };
            }
            let daysRemaining;
            if (enrollment.expiresAt) {
                const diffTime = new Date(enrollment.expiresAt).getTime() - new Date().getTime();
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            return {
                canAccess: true,
                reason: 'enrolled',
                enrollment: {
                    id: enrollment.id,
                    enrollmentType: enrollment.enrollmentTypeName || 'Standard',
                    expiresAt: enrollment.expiresAt,
                    daysRemaining,
                    isExpired: false,
                },
            };
        }
        return { canAccess: false, reason: 'denied' };
    }
    async getCourseLessons(courseId, userId, userRole) {
        const courseLessons = await this.db
            .select({
            id: database_1.lessons.id,
            uuid: database_1.lessons.uuid,
            sectionId: database_1.lessons.sectionId,
            titleEn: database_1.lessons.titleEn,
            titleAr: database_1.lessons.titleAr,
            descriptionEn: database_1.lessons.descriptionEn,
            descriptionAr: database_1.lessons.descriptionAr,
            videoUrl: database_1.lessons.videoUrl,
            attachmentUrl: database_1.lessons.attachmentUrl,
            durationMinutes: database_1.lessons.durationMinutes,
            displayOrder: database_1.lessons.displayOrder,
            isPreview: database_1.lessons.isPreview,
            createdAt: database_1.lessons.createdAt,
        })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courseSections.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.lessons.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.courseSections.isDeleted, false)))
            .orderBy(database_1.lessons.displayOrder);
        if (!userId || !userRole) {
            return courseLessons.map((lesson) => ({
                ...lesson,
                canAccess: lesson.isPreview,
                accessReason: lesson.isPreview ? 'preview' : 'denied',
            }));
        }
        const [courseData] = await this.db
            .select({ instructorId: database_1.courses.instructorId })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.eq)(database_1.courses.id, courseId))
            .limit(1);
        const isAdmin = userRole === 'admin';
        const isInstructor = courseData && courseData.instructorId === userId;
        if (isAdmin || isInstructor) {
            return courseLessons.map((lesson) => ({
                ...lesson,
                canAccess: true,
                accessReason: isAdmin ? 'admin' : 'instructor',
            }));
        }
        const [enrollment] = await this.db
            .select()
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.userId, userId), (0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)))
            .limit(1);
        const isEnrolled = enrollment &&
            (!enrollment.expiresAt || new Date(enrollment.expiresAt) > new Date());
        return courseLessons.map((lesson) => ({
            ...lesson,
            canAccess: lesson.isPreview || isEnrolled,
            accessReason: lesson.isPreview
                ? 'preview'
                : isEnrolled
                    ? 'enrolled'
                    : 'denied',
        }));
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map