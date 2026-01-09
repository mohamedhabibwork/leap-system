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
exports.CreatePlanFeatureDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePlanFeatureDto {
    plan_id;
    feature_name;
    feature_value;
    is_enabled;
}
exports.CreatePlanFeatureDto = CreatePlanFeatureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlanFeatureDto.prototype, "plan_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Unlimited Access' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanFeatureDto.prototype, "feature_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Access to all courses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanFeatureDto.prototype, "feature_value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePlanFeatureDto.prototype, "is_enabled", void 0);
//# sourceMappingURL=create-plan-feature.dto.js.map