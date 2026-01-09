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
exports.CreateAdDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAdDto {
    campaignId;
    adTypeId;
    targetType;
    targetId;
    externalUrl;
    titleEn;
    titleAr;
    descriptionEn;
    descriptionAr;
    mediaUrl;
    callToAction;
    placementTypeId;
    priority;
    startDate;
    endDate;
    isPaid;
    targetingRules;
}
exports.CreateAdDto = CreateAdDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Campaign ID to associate this ad with' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ad type lookup ID (banner, sponsored, popup, video)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "adTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target entity type', enum: ['course', 'event', 'job', 'post', 'external'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['course', 'event', 'job', 'post', 'external']),
    __metadata("design:type", String)
], CreateAdDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target entity ID (if targeting internal content)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "targetId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External URL (if targeting external link)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "externalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ad title in English' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "titleEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ad title in Arabic' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "titleAr", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ad description in English' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "descriptionEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ad description in Arabic' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "descriptionAr", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media URL (image or video)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Call to action text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "callToAction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Placement type lookup ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "placementTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ad priority (higher = more prominent)', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateAdDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date for ad display' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for ad display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAdDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is this a paid ad?', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAdDto.prototype, "isPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Targeting rules object' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAdDto.prototype, "targetingRules", void 0);
//# sourceMappingURL=create-ad.dto.js.map