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
exports.InstructorController = void 0;
const common_1 = require("@nestjs/common");
const instructor_service_1 = require("./instructor.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const instructor_dashboard_dto_1 = require("./dto/instructor-dashboard.dto");
let InstructorController = class InstructorController {
    instructorService;
    constructor(instructorService) {
        this.instructorService = instructorService;
    }
    async getDashboard(req) {
        const instructorId = req.user.id;
        return this.instructorService.getDashboard(instructorId);
    }
    async getCourses(req) {
        const instructorId = req.user.id;
        return this.instructorService.getInstructorCourses(instructorId);
    }
    async getCourseStudents(req, courseId) {
        const instructorId = req.user.id;
        return this.instructorService.getCourseStudents(instructorId, courseId);
    }
    async getCourseAnalytics(req, courseId) {
        const instructorId = req.user.id;
        return this.instructorService.getCourseAnalytics(instructorId, courseId);
    }
    async getUpcomingSessions(req) {
        const instructorId = req.user.id;
        return this.instructorService.getUpcomingSessions(instructorId);
    }
    async getCalendarSessions(req, startDate, endDate) {
        const instructorId = req.user.id;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.instructorService.getCalendarSessions(instructorId, start, end);
    }
    async getPendingAssignments(req) {
        const instructorId = req.user.id;
        return this.instructorService.getPendingAssignments(instructorId);
    }
    async getQuizAttempts(req) {
        const instructorId = req.user.id;
        return this.instructorService.getQuizAttempts(instructorId);
    }
};
exports.InstructorController = InstructorController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get instructor dashboard overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: instructor_dashboard_dto_1.InstructorDashboardDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all courses for instructor with stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [instructor_dashboard_dto_1.CourseStatsDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Get)('courses/:id/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrolled students for a course' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [instructor_dashboard_dto_1.StudentProgressDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getCourseStudents", null);
__decorate([
    (0, common_1.Get)('courses/:id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get course analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: instructor_dashboard_dto_1.CourseAnalyticsDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getCourseAnalytics", null);
__decorate([
    (0, common_1.Get)('sessions/upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming scheduled sessions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getUpcomingSessions", null);
__decorate([
    (0, common_1.Get)('sessions/calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sessions for calendar view' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getCalendarSessions", null);
__decorate([
    (0, common_1.Get)('assignments/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending assignments to grade' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getPendingAssignments", null);
__decorate([
    (0, common_1.Get)('quizzes/attempts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent quiz attempts' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getQuizAttempts", null);
exports.InstructorController = InstructorController = __decorate([
    (0, swagger_1.ApiTags)('lms/instructor'),
    (0, common_1.Controller)('lms/instructor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('instructor', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [instructor_service_1.InstructorService])
], InstructorController);
//# sourceMappingURL=instructor.controller.js.map