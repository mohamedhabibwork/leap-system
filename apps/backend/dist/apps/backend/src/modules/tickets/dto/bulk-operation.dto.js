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
exports.BulkTicketOperationDto = exports.TicketBulkAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var TicketBulkAction;
(function (TicketBulkAction) {
    TicketBulkAction["DELETE"] = "delete";
    TicketBulkAction["CLOSE"] = "close";
    TicketBulkAction["ASSIGN"] = "assign";
    TicketBulkAction["CHANGE_STATUS"] = "change_status";
    TicketBulkAction["CHANGE_PRIORITY"] = "change_priority";
})(TicketBulkAction || (exports.TicketBulkAction = TicketBulkAction = {}));
class BulkTicketOperationDto {
    ids;
    action;
    reason;
    assignToId;
    statusId;
    priorityId;
}
exports.BulkTicketOperationDto = BulkTicketOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of ticket IDs', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkTicketOperationDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform', enum: TicketBulkAction }),
    (0, class_validator_1.IsEnum)(TicketBulkAction),
    __metadata("design:type", String)
], BulkTicketOperationDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for action' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkTicketOperationDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assign to user ID (for ASSIGN action)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BulkTicketOperationDto.prototype, "assignToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New status ID (for CHANGE_STATUS action)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BulkTicketOperationDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New priority ID (for CHANGE_PRIORITY action)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BulkTicketOperationDto.prototype, "priorityId", void 0);
//# sourceMappingURL=bulk-operation.dto.js.map