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
exports.QuizzesController = void 0;
const common_1 = require("@nestjs/common");
const quizzes_service_1 = require("./quizzes.service");
const review_attempt_dto_1 = require("./dto/review-attempt.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
let QuizzesController = class QuizzesController {
    quizzesService;
    constructor(quizzesService) {
        this.quizzesService = quizzesService;
    }
    getQuizAttempts(id, req) {
        const instructorId = req.user.id;
        return this.quizzesService.getQuizAttempts(id, instructorId);
    }
    getAttemptDetails(id, req) {
        const instructorId = req.user.id;
        return this.quizzesService.getAttemptDetails(id, instructorId);
    }
    reviewAttempt(id, reviewDto, req) {
        const instructorId = req.user.id;
        return this.quizzesService.reviewAttempt(id, reviewDto, instructorId);
    }
    getAllAttempts(req, courseId) {
        const instructorId = req.user.id;
        const parsedCourseId = courseId ? parseInt(courseId) : undefined;
        return this.quizzesService.getAllAttempts(instructorId, parsedCourseId);
    }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, common_1.Get)(':id/attempts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attempts for a quiz' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getQuizAttempts", null);
__decorate([
    (0, common_1.Get)('attempts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed attempt information' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getAttemptDetails", null);
__decorate([
    (0, common_1.Post)('attempts/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Add review/feedback to quiz attempt' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, review_attempt_dto_1.ReviewAttemptDto, Object]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "reviewAttempt", null);
__decorate([
    (0, common_1.Get)('attempts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quiz attempts for instructor courses' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "getAllAttempts", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, swagger_1.ApiTags)('lms/quizzes'),
    (0, common_1.Controller)('lms/quizzes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('instructor', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map