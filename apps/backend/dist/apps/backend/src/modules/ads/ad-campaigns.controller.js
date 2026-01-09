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
exports.AdCampaignsController = void 0;
const common_1 = require("@nestjs/common");
const ad_campaigns_service_1 = require("./ad-campaigns.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdCampaignsController = class AdCampaignsController {
    adCampaignsService;
    constructor(adCampaignsService) {
        this.adCampaignsService = adCampaignsService;
    }
    create(createCampaignDto, req) {
        return this.adCampaignsService.create(createCampaignDto, req.user.id);
    }
    findAll(req, page, limit) {
        return this.adCampaignsService.findAll(req.user.id, page, limit);
    }
    findOne(id) {
        return this.adCampaignsService.findOne(id);
    }
    update(id, updateCampaignDto, req) {
        const isAdmin = req.user.roles?.includes('admin');
        return this.adCampaignsService.update(id, updateCampaignDto, req.user.id, isAdmin);
    }
    remove(id, req) {
        const isAdmin = req.user.roles?.includes('admin');
        return this.adCampaignsService.remove(id, req.user.id, isAdmin);
    }
    getAnalytics(id, req) {
        const isAdmin = req.user.roles?.includes('admin');
        return this.adCampaignsService.getAnalytics(id, req.user.id, isAdmin);
    }
};
exports.AdCampaignsController = AdCampaignsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'instructor', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campaign' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCampaignDto, Object]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all campaigns' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaign details with ads' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update campaign' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateCampaignDto, Object]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete campaign' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaign analytics' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdCampaignsController.prototype, "getAnalytics", null);
exports.AdCampaignsController = AdCampaignsController = __decorate([
    (0, swagger_1.ApiTags)('ads/campaigns'),
    (0, common_1.Controller)('ads/campaigns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ad_campaigns_service_1.AdCampaignsService])
], AdCampaignsController);
//# sourceMappingURL=ad-campaigns.controller.js.map