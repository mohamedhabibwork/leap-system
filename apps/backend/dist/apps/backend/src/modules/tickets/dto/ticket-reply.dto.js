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
exports.UpdateTicketReplyDto = exports.CreateTicketReplyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTicketReplyDto {
    ticketId;
    message;
    isInternal = false;
    attachmentUrl;
}
exports.CreateTicketReplyDto = CreateTicketReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ticket ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketReplyDto.prototype, "ticketId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reply message' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTicketReplyDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is internal note (only visible to staff)', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTicketReplyDto.prototype, "isInternal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Attachment URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTicketReplyDto.prototype, "attachmentUrl", void 0);
class UpdateTicketReplyDto {
    message;
    isInternal;
    attachmentUrl;
}
exports.UpdateTicketReplyDto = UpdateTicketReplyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTicketReplyDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is internal note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTicketReplyDto.prototype, "isInternal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Attachment URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTicketReplyDto.prototype, "attachmentUrl", void 0);
//# sourceMappingURL=ticket-reply.dto.js.map