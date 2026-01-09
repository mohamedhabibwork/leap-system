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
exports.MarkAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MarkAttendanceDto {
    userId;
    enrollmentId;
    attendanceStatusId;
    joinedAt;
    leftAt;
    durationMinutes;
}
exports.MarkAttendanceDto = MarkAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarkAttendanceDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enrollment ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarkAttendanceDto.prototype, "enrollmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance status ID (present, absent, late)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarkAttendanceDto.prototype, "attendanceStatusId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time user joined', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "joinedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time user left', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MarkAttendanceDto.prototype, "leftAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in minutes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MarkAttendanceDto.prototype, "durationMinutes", void 0);
//# sourceMappingURL=mark-attendance.dto.js.map