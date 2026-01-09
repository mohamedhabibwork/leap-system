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
exports.SyncConfigDto = exports.BulkSyncUsersDto = exports.SyncRolesDto = exports.SyncUserToKeycloakDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SyncUserToKeycloakDto {
    userId;
}
exports.SyncUserToKeycloakDto = SyncUserToKeycloakDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID to sync to Keycloak' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncUserToKeycloakDto.prototype, "userId", void 0);
class SyncRolesDto {
    syncRoles;
    syncPermissions;
}
exports.SyncRolesDto = SyncRolesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync roles to Keycloak', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SyncRolesDto.prototype, "syncRoles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync permissions to Keycloak', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SyncRolesDto.prototype, "syncPermissions", void 0);
class BulkSyncUsersDto {
    userIds;
    batchSize;
}
exports.BulkSyncUsersDto = BulkSyncUsersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific user IDs to sync (leave empty for all)', type: [Number] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BulkSyncUsersDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Batch size for processing', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkSyncUsersDto.prototype, "batchSize", void 0);
class SyncConfigDto {
    enabled;
    syncOnCreate;
    syncOnUpdate;
}
exports.SyncConfigDto = SyncConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable/disable sync' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SyncConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync on user creation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SyncConfigDto.prototype, "syncOnCreate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync on user update' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SyncConfigDto.prototype, "syncOnUpdate", void 0);
//# sourceMappingURL=sync-keycloak.dto.js.map