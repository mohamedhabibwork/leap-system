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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseAnalyticsDto = exports.StudentProgressDto = exports.CourseStatsDto = exports.InstructorDashboardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InstructorDashboardDto {
    totalCourses;
    totalStudents;
    totalRevenue;
    averageRating;
    pendingAssignments;
    upcomingSessions;
    recentActivity;
}
exports.InstructorDashboardDto = InstructorDashboardDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstructorDashboardDto.prototype, "totalCourses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstructorDashboardDto.prototype, "totalStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstructorDashboardDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstructorDashboardDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstructorDashboardDto.prototype, "pendingAssignments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], InstructorDashboardDto.prototype, "upcomingSessions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], InstructorDashboardDto.prototype, "recentActivity", void 0);
class CourseStatsDto {
    courseId;
    courseName;
    enrollmentCount;
    completionRate;
    averageRating;
    revenue;
    activeStudents;
}
exports.CourseStatsDto = CourseStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CourseStatsDto.prototype, "courseName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "enrollmentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "completionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "revenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseStatsDto.prototype, "activeStudents", void 0);
class StudentProgressDto {
    userId;
    userName;
    userEmail;
    courseId;
    progressPercentage;
    completedLessons;
    totalLessons;
    lastAccessedAt;
    enrolledAt;
}
exports.StudentProgressDto = StudentProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StudentProgressDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StudentProgressDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StudentProgressDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StudentProgressDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StudentProgressDto.prototype, "progressPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StudentProgressDto.prototype, "completedLessons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StudentProgressDto.prototype, "totalLessons", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StudentProgressDto.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StudentProgressDto.prototype, "enrolledAt", void 0);
class CourseAnalyticsDto {
    courseId;
    enrollmentTrend;
    completionRate;
    averageQuizScores;
    studentEngagement;
    revenueTrend;
    ratingDistribution;
}
exports.CourseAnalyticsDto = CourseAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseAnalyticsDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CourseAnalyticsDto.prototype, "enrollmentTrend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CourseAnalyticsDto.prototype, "completionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CourseAnalyticsDto.prototype, "averageQuizScores", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], CourseAnalyticsDto.prototype, "studentEngagement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CourseAnalyticsDto.prototype, "revenueTrend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CourseAnalyticsDto.prototype, "ratingDistribution", void 0);
//# sourceMappingURL=instructor-dashboard.dto.js.map