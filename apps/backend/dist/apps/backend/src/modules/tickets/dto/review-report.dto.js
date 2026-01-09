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
exports.ReviewReportDto = exports.ReportAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ReportAction;
(function (ReportAction) {
    ReportAction["WARNING"] = "warning";
    ReportAction["SUSPEND"] = "suspend";
    ReportAction["BAN"] = "ban";
    ReportAction["DELETE_CONTENT"] = "delete_content";
    ReportAction["DISMISS"] = "dismiss";
})(ReportAction || (exports.ReportAction = ReportAction = {}));
class ReviewReportDto {
    action;
    adminNotes;
    reason;
}
exports.ReviewReportDto = ReviewReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to take', enum: ReportAction }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(ReportAction),
    __metadata("design:type", String)
], ReviewReportDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewReportDto.prototype, "adminNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for action' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewReportDto.prototype, "reason", void 0);
//# sourceMappingURL=review-report.dto.js.map