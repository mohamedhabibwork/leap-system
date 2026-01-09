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
exports.BulkPageOperationDto = exports.PageBulkAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PageBulkAction;
(function (PageBulkAction) {
    PageBulkAction["DELETE"] = "delete";
    PageBulkAction["VERIFY"] = "verify";
    PageBulkAction["UNVERIFY"] = "unverify";
    PageBulkAction["FEATURE"] = "feature";
    PageBulkAction["UNFEATURE"] = "unfeature";
})(PageBulkAction || (exports.PageBulkAction = PageBulkAction = {}));
class BulkPageOperationDto {
    ids;
    action;
}
exports.BulkPageOperationDto = BulkPageOperationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of page IDs', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkPageOperationDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform', enum: PageBulkAction }),
    (0, class_validator_1.IsEnum)(PageBulkAction),
    __metadata("design:type", String)
], BulkPageOperationDto.prototype, "action", void 0);
//# sourceMappingURL=bulk-page-operation.dto.js.map