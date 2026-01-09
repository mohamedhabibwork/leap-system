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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lookups_service_1 = require("./lookups.service");
const admin_lookup_query_dto_1 = require("./dto/admin-lookup-query.dto");
const bulk_lookup_operation_dto_1 = require("./dto/bulk-lookup-operation.dto");
const reorder_lookups_dto_1 = require("./dto/reorder-lookups.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let LookupsController = class LookupsController {
    lookupsService;
    constructor(lookupsService) {
        this.lookupsService = lookupsService;
    }
    findAll(query) {
        return this.lookupsService.findAllAdmin(query);
    }
    findByType(typeCode, query) {
        return this.lookupsService.findByType(typeCode, query);
    }
    getStatistics() {
        return this.lookupsService.getStatistics();
    }
    findOne(id) {
        return this.lookupsService.findOne(id);
    }
    create(data) {
        return this.lookupsService.create(data);
    }
    update(id, data) {
        return this.lookupsService.update(id, data);
    }
    remove(id) {
        return this.lookupsService.remove(id);
    }
    reorder(dto) {
        return this.lookupsService.reorder(dto);
    }
    bulkOperation(dto) {
        return this.lookupsService.bulkOperation(dto);
    }
    export(query) {
        return this.lookupsService.exportToCsv(query);
    }
};
exports.LookupsController = LookupsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lookups with pagination and filtering' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_lookup_query_dto_1.AdminLookupQueryDto]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('type/:typeCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lookups by type code' }),
    __param(0, (0, common_1.Param)('typeCode')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_lookup_query_dto_1.AdminLookupQueryDto]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lookup statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "getStatistics", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lookup by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create lookup' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update lookup' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete lookup (soft delete)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('reorder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder lookups' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_lookups_dto_1.ReorderLookupsDto]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "reorder", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk operations on lookups' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_lookup_operation_dto_1.BulkLookupOperationDto]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "bulkOperation", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export lookups to CSV' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_lookup_query_dto_1.AdminLookupQueryDto]),
    __metadata("design:returntype", void 0)
], LookupsController.prototype, "export", null);
exports.LookupsController = LookupsController = __decorate([
    (0, swagger_1.ApiTags)('Lookups'),
    (0, common_1.Controller)('lookups'),
    __metadata("design:paramtypes", [lookups_service_1.LookupsService])
], LookupsController);
//# sourceMappingURL=lookups.controller.js.map