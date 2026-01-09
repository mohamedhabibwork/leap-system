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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    create(createMediaDto) {
        return this.mediaService.create(createMediaDto);
    }
    findAll() {
        return this.mediaService.findAll();
    }
    findByUploadable(type, id) {
        return this.mediaService.findByUploadable(type, id);
    }
    findOne(id) {
        return this.mediaService.findOne(id);
    }
    update(id, updateMediaDto) {
        return this.mediaService.update(id, updateMediaDto);
    }
    async trackDownload(id) {
        await this.mediaService.incrementDownloadCount(id);
        return { message: 'Download tracked successfully' };
    }
    remove(id) {
        return this.mediaService.remove(id);
    }
    async cleanupTemporary() {
        const count = await this.mediaService.cleanupTemporaryFiles();
        return { message: `Cleaned up ${count} temporary files` };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media file' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Media uploaded successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all media files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-uploadable'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media by uploadable entity' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'id', required: true, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media retrieved successfully' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findByUploadable", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media retrieved successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media updated successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Track media download' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Download tracked successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "trackDownload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('cleanup-temporary'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Cleanup temporary files (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Temporary files cleaned up' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "cleanupTemporary", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('media'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map