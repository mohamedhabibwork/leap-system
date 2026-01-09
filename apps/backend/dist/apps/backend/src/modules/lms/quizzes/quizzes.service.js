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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let QuizzesService = class QuizzesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getQuizAttempts(quizId, instructorId) {
        const [quiz] = await this.db
            .select({
            quizId: database_1.quizzes.id,
            courseId: database_1.courseSections.courseId,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.quizzes)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.quizzes.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.quizzes.id, quizId), (0, drizzle_orm_1.eq)(database_1.quizzes.isDeleted, false)))
            .limit(1);
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to view these attempts');
        }
        const attempts = await this.db
            .select({
            id: database_1.quizAttempts.id,
            uuid: database_1.quizAttempts.uuid,
            userId: database_1.quizAttempts.userId,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            attemptNumber: database_1.quizAttempts.attemptNumber,
            score: database_1.quizAttempts.score,
            maxScore: database_1.quizAttempts.maxScore,
            isPassed: database_1.quizAttempts.isPassed,
            startedAt: database_1.quizAttempts.startedAt,
            completedAt: database_1.quizAttempts.completedAt,
        })
            .from(database_1.quizAttempts)
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.quizAttempts.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.quizAttempts.quizId, quizId), (0, drizzle_orm_1.eq)(database_1.quizAttempts.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.desc)(database_1.quizAttempts.completedAt));
        return attempts;
    }
    async getAttemptDetails(attemptId, instructorId) {
        const [attempt] = await this.db
            .select({
            id: database_1.quizAttempts.id,
            uuid: database_1.quizAttempts.uuid,
            quizId: database_1.quizAttempts.quizId,
            quizTitle: database_1.quizzes.titleEn,
            userId: database_1.quizAttempts.userId,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            attemptNumber: database_1.quizAttempts.attemptNumber,
            score: database_1.quizAttempts.score,
            maxScore: database_1.quizAttempts.maxScore,
            isPassed: database_1.quizAttempts.isPassed,
            startedAt: database_1.quizAttempts.startedAt,
            completedAt: database_1.quizAttempts.completedAt,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.quizAttempts)
            .innerJoin(database_1.quizzes, (0, drizzle_orm_1.eq)(database_1.quizAttempts.quizId, database_1.quizzes.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.quizzes.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.quizAttempts.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.quizAttempts.id, attemptId), (0, drizzle_orm_1.eq)(database_1.quizAttempts.isDeleted, false)))
            .limit(1);
        if (!attempt) {
            throw new common_1.NotFoundException('Quiz attempt not found');
        }
        if (attempt.instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to view this attempt');
        }
        const answers = await this.db
            .select({
            id: database_1.quizAnswers.id,
            questionId: database_1.quizAnswers.questionId,
            questionText: database_1.questionBank.questionTextEn,
            selectedOptionId: database_1.quizAnswers.selectedOptionId,
            answerText: database_1.quizAnswers.answerText,
            isCorrect: database_1.quizAnswers.isCorrect,
            pointsEarned: database_1.quizAnswers.pointsEarned,
            maxPoints: database_1.questionBank.points,
        })
            .from(database_1.quizAnswers)
            .innerJoin(database_1.questionBank, (0, drizzle_orm_1.eq)(database_1.quizAnswers.questionId, database_1.questionBank.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.quizAnswers.attemptId, attemptId), (0, drizzle_orm_1.eq)(database_1.quizAnswers.isDeleted, false)));
        return {
            ...attempt,
            answers,
        };
    }
    async reviewAttempt(attemptId, reviewDto, instructorId) {
        const attempt = await this.getAttemptDetails(attemptId, instructorId);
        return {
            message: 'Review added successfully',
            attemptId,
            feedback: reviewDto.feedback,
            notes: reviewDto.notes,
        };
    }
    async getAllAttempts(instructorId, courseId) {
        const conditions = [
            (0, drizzle_orm_1.eq)(database_1.quizAttempts.isDeleted, false),
            (0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId),
        ];
        if (courseId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.courses.id, courseId));
        }
        const attempts = await this.db
            .select({
            id: database_1.quizAttempts.id,
            uuid: database_1.quizAttempts.uuid,
            quizId: database_1.quizAttempts.quizId,
            quizTitle: database_1.quizzes.titleEn,
            userId: database_1.quizAttempts.userId,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            attemptNumber: database_1.quizAttempts.attemptNumber,
            score: database_1.quizAttempts.score,
            maxScore: database_1.quizAttempts.maxScore,
            isPassed: database_1.quizAttempts.isPassed,
            completedAt: database_1.quizAttempts.completedAt,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.quizAttempts)
            .innerJoin(database_1.quizzes, (0, drizzle_orm_1.eq)(database_1.quizAttempts.quizId, database_1.quizzes.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.quizzes.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.quizAttempts.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(database_1.quizAttempts.completedAt))
            .limit(100);
        return attempts;
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map