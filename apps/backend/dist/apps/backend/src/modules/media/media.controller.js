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
const platform_express_1 = require("@nestjs/platform-express");
const media_service_1 = require("./media.service");
const minio_service_1 = require("./minio.service");
const r2_service_1 = require("./r2.service");
const dto_1 = require("./dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const config_1 = require("@nestjs/config");
let MediaController = class MediaController {
    mediaService;
    minioService;
    r2Service;
    configService;
    storageProvider;
    constructor(mediaService, minioService, r2Service, configService) {
        this.mediaService = mediaService;
        this.minioService = minioService;
        this.r2Service = r2Service;
        this.configService = configService;
        this.storageProvider = this.configService.get('STORAGE_PROVIDER') === 'r2' ? 'r2' : 'minio';
    }
    async uploadFile(file, folder = 'general') {
        if (this.storageProvider === 'r2') {
            return await this.r2Service.uploadFile(file, folder);
        }
        return await this.minioService.uploadFile(file, folder);
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
    async deleteFile(key) {
        if (this.storageProvider === 'r2') {
            await this.r2Service.deleteFile(key);
        }
        else {
            await this.minioService.deleteFile(key);
        }
        return { message: 'File deleted successfully' };
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
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file to storage (MinIO or R2)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                folder: {
                    type: 'string',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create media record' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Media record created successfully' }),
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
    (0, common_1.Delete)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete file from storage' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File deleted successfully' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media record' }),
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
    __metadata("design:paramtypes", [media_service_1.MediaService,
        minio_service_1.MinioService,
        r2_service_1.R2Service,
        config_1.ConfigService])
], MediaController);
//# sourceMappingURL=media.controller.js.map