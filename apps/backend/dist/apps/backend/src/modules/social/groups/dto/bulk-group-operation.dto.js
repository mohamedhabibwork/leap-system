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
exports.BulkGroupOperationDto = exports.GroupBulkAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var GroupBulkAction;
(function (GroupBulkAction) {
    GroupBulkAction["DELETE"] = "delete";
    GroupBulkAction["APPROVE"] = "approve";
    GroupBulkAction["REJECT"] = "reject";
    GroupBulkAction["FEATURE"] = "feature";
    GroupBulkAction["UNFEATURE"] = "unfeature";
})(GroupBulkAction || (exports.GroupBulkAction = GroupBulkAction = {}));
class BulkGroupOperationDto {
    ids;
    action;
}
exports.BulkGroupOperationDto = BulkGroupOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of group IDs', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkGroupOperationDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform', enum: GroupBulkAction }),
    (0, class_validator_1.IsEnum)(GroupBulkAction),
    __metadata("design:type", String)
], BulkGroupOperationDto.prototype, "action", void 0);
//# sourceMappingURL=bulk-group-operation.dto.js.map