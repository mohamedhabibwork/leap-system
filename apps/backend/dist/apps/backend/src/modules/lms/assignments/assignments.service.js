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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let AssignmentsService = class AssignmentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async gradeSubmission(submissionId, gradeDto, instructorId) {
        const [submission] = await this.db
            .select({
            id: database_1.assignmentSubmissions.id,
            assignmentId: database_1.assignmentSubmissions.assignmentId,
            userId: database_1.assignmentSubmissions.userId,
            sectionId: database_1.assignments.sectionId,
            courseId: database_1.courseSections.courseId,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.assignmentSubmissions)
            .innerJoin(database_1.assignments, (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.assignmentId, database_1.assignments.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.assignments.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.id, submissionId), (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.isDeleted, false)))
            .limit(1);
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to grade this submission');
        }
        const [graded] = await this.db
            .update(database_1.assignmentSubmissions)
            .set({
            score: gradeDto.score.toString(),
            maxPoints: gradeDto.maxPoints.toString(),
            feedback: gradeDto.feedback,
            gradedBy: gradeDto.gradedBy || instructorId,
            gradedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.id, submissionId))
            .returning();
        return graded;
    }
    async getPendingSubmissions(instructorId, courseId) {
        const conditions = [
            (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.isDeleted, false),
            (0, drizzle_orm_1.isNull)(database_1.assignmentSubmissions.gradedAt),
            (0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId),
        ];
        if (courseId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.courses.id, courseId));
        }
        const submissions = await this.db
            .select({
            id: database_1.assignmentSubmissions.id,
            uuid: database_1.assignmentSubmissions.uuid,
            assignmentId: database_1.assignmentSubmissions.assignmentId,
            assignmentTitle: database_1.assignments.titleEn,
            userId: database_1.assignmentSubmissions.userId,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            submissionText: database_1.assignmentSubmissions.submissionText,
            fileUrl: database_1.assignmentSubmissions.fileUrl,
            submittedAt: database_1.assignmentSubmissions.submittedAt,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.assignmentSubmissions)
            .innerJoin(database_1.assignments, (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.assignmentId, database_1.assignments.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.assignments.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.assignmentSubmissions.submittedAt))
            .limit(100);
        return submissions;
    }
    async getSubmissionDetails(submissionId, instructorId) {
        const [submission] = await this.db
            .select({
            id: database_1.assignmentSubmissions.id,
            uuid: database_1.assignmentSubmissions.uuid,
            assignmentId: database_1.assignmentSubmissions.assignmentId,
            assignmentTitle: database_1.assignments.titleEn,
            assignmentDescription: database_1.assignments.descriptionEn,
            assignmentInstructions: database_1.assignments.instructionsEn,
            maxPoints: database_1.assignments.maxPoints,
            userId: database_1.assignmentSubmissions.userId,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            submissionText: database_1.assignmentSubmissions.submissionText,
            fileUrl: database_1.assignmentSubmissions.fileUrl,
            statusId: database_1.assignmentSubmissions.statusId,
            score: database_1.assignmentSubmissions.score,
            submittedMaxPoints: database_1.assignmentSubmissions.maxPoints,
            feedback: database_1.assignmentSubmissions.feedback,
            submittedAt: database_1.assignmentSubmissions.submittedAt,
            gradedAt: database_1.assignmentSubmissions.gradedAt,
            gradedBy: database_1.assignmentSubmissions.gradedBy,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.assignmentSubmissions)
            .innerJoin(database_1.assignments, (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.assignmentId, database_1.assignments.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.assignments.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.id, submissionId), (0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.isDeleted, false)))
            .limit(1);
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to view this submission');
        }
        return submission;
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map