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
exports.BulkTrackImpressionDto = exports.TrackImpressionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TrackImpressionDto {
    adId;
    placementCode;
    userId;
    sessionId;
    metadata;
}
exports.TrackImpressionDto = TrackImpressionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ad ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TrackImpressionDto.prototype, "adId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Placement code where ad was shown' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackImpressionDto.prototype, "placementCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID (if authenticated)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TrackImpressionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackImpressionDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TrackImpressionDto.prototype, "metadata", void 0);
class BulkTrackImpressionDto {
    impressions;
}
exports.BulkTrackImpressionDto = BulkTrackImpressionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of impressions to track', type: [TrackImpressionDto] }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkTrackImpressionDto.prototype, "impressions", void 0);
//# sourceMappingURL=track-impression.dto.js.map