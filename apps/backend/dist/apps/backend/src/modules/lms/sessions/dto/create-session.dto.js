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
exports.CreateSessionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSessionDto {
    lessonId;
    titleEn;
    titleAr;
    sessionTypeId;
    startTime;
    endTime;
    timezone;
    meetingUrl;
    meetingPassword;
    maxAttendees;
    descriptionEn;
    descriptionAr;
    statusId;
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lesson ID this session belongs to' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "lessonId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session title in English' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "titleEn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session title in Arabic', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "titleAr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session type ID (live, recorded, hybrid)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "sessionTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session start time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session end time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timezone', required: false, default: 'UTC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meeting URL (Zoom, Google Meet, etc.)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "meetingUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meeting password', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "meetingPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum number of attendees', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "maxAttendees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session description in English', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "descriptionEn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session description in Arabic', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "descriptionAr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session status ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "statusId", void 0);
//# sourceMappingURL=create-session.dto.js.map