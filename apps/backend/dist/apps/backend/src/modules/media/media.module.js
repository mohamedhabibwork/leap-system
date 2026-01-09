"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const minio_service_1 = require("./minio.service");
const r2_service_1 = require("./r2.service");
const image_processing_service_1 = require("./image-processing.service");
const media_controller_1 = require("./media.controller");
const database_module_1 = require("../../database/database.module");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService, minio_service_1.MinioService, r2_service_1.R2Service, image_processing_service_1.ImageProcessingService],
        exports: [media_service_1.MediaService, minio_service_1.MinioService, r2_service_1.R2Service, image_processing_service_1.ImageProcessingService],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map