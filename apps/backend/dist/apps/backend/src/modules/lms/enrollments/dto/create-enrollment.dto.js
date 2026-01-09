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
exports.CreateEnrollmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEnrollmentDto {
    userId;
    course_id;
    enrollment_type;
    status;
}
exports.CreateEnrollmentDto = CreateEnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "course_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'purchase', enum: ['purchase', 'subscription'] }),
    (0, class_validator_1.IsEnum)(['purchase', 'subscription']),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "enrollment_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'completed', enum: ['active', 'completed', 'expired', 'cancelled'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'completed', 'expired', 'cancelled']),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "status", void 0);
//# sourceMappingURL=create-enrollment.dto.js.map