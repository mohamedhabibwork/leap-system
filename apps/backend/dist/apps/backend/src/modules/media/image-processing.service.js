"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let ImageProcessingService = ImageProcessingService_1 = class ImageProcessingService {
    logger = new common_1.Logger(ImageProcessingService_1.name);
    defaultThumbnailSizes = {
        small: { width: 150, height: 150 },
        medium: { width: 300, height: 300 },
        large: { width: 600, height: 600 },
    };
    async optimizeImage(buffer, options = {}) {
        try {
            let image = (0, sharp_1.default)(buffer);
            const metadata = await image.metadata();
            if (options.width || options.height) {
                image = image.resize({
                    width: options.width,
                    height: options.height,
                    fit: options.fit || 'inside',
                    withoutEnlargement: true,
                });
            }
            const quality = options.quality || 80;
            if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                image = image.jpeg({ quality, progressive: true });
            }
            else if (metadata.format === 'png') {
                image = image.png({ quality, compressionLevel: 9 });
            }
            else if (metadata.format === 'webp') {
                image = image.webp({ quality });
            }
            return await image.toBuffer();
        }
        catch (error) {
            this.logger.error('Error optimizing image:', error);
            throw error;
        }
    }
    async generateThumbnail(buffer, width, height, quality = 80) {
        try {
            return await (0, sharp_1.default)(buffer)
                .resize(width, height, {
                fit: 'cover',
                position: 'center',
            })
                .jpeg({ quality })
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error generating thumbnail:', error);
            throw error;
        }
    }
    async generateThumbnails(buffer, sizes = this.defaultThumbnailSizes) {
        try {
            const [small, medium, large] = await Promise.all([
                this.generateThumbnail(buffer, sizes.small.width, sizes.small.height),
                this.generateThumbnail(buffer, sizes.medium.width, sizes.medium.height),
                this.generateThumbnail(buffer, sizes.large.width, sizes.large.height),
            ]);
            return { small, medium, large };
        }
        catch (error) {
            this.logger.error('Error generating thumbnails:', error);
            throw error;
        }
    }
    async convertToWebP(buffer, quality = 80) {
        try {
            return await (0, sharp_1.default)(buffer)
                .webp({ quality })
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error converting to WebP:', error);
            throw error;
        }
    }
    async processImage(buffer, options = {}) {
        try {
            const result = {
                original: buffer,
            };
            result.original = await this.optimizeImage(buffer, options.resize);
            if (options.generateThumbnails) {
                result.thumbnails = await this.generateThumbnails(buffer);
            }
            if (options.convertToWebP) {
                result.webp = await this.convertToWebP(buffer);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error processing image:', error);
            throw error;
        }
    }
    async getMetadata(buffer) {
        try {
            return await (0, sharp_1.default)(buffer).metadata();
        }
        catch (error) {
            this.logger.error('Error getting metadata:', error);
            throw error;
        }
    }
    async addWatermark(buffer, watermarkBuffer, options = {}) {
        try {
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            const watermarkWidth = Math.floor((metadata.width || 800) * 0.1);
            const resizedWatermark = await (0, sharp_1.default)(watermarkBuffer)
                .resize(watermarkWidth)
                .toBuffer();
            return await (0, sharp_1.default)(buffer)
                .composite([
                {
                    input: resizedWatermark,
                    gravity: options.gravity || 'southeast',
                    blend: 'over',
                },
            ])
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error adding watermark:', error);
            throw error;
        }
    }
    async cropImage(buffer, options) {
        try {
            return await (0, sharp_1.default)(buffer)
                .extract(options)
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error cropping image:', error);
            throw error;
        }
    }
    async rotateImage(buffer, angle) {
        try {
            return await (0, sharp_1.default)(buffer)
                .rotate(angle)
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error rotating image:', error);
            throw error;
        }
    }
    async autoOrient(buffer) {
        try {
            return await (0, sharp_1.default)(buffer)
                .rotate()
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error auto-orienting image:', error);
            throw error;
        }
    }
    async isValidImage(buffer) {
        try {
            await (0, sharp_1.default)(buffer).metadata();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getImageDimensions(buffer) {
        const metadata = await this.getMetadata(buffer);
        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
        };
    }
    generateUniqueFilename(originalFilename, suffix) {
        const ext = path.extname(originalFilename);
        const name = path.basename(originalFilename, ext);
        const hash = crypto.randomBytes(8).toString('hex');
        const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
        if (suffix) {
            return `${safeName}_${suffix}_${hash}${ext}`;
        }
        return `${safeName}_${hash}${ext}`;
    }
};
exports.ImageProcessingService = ImageProcessingService;
exports.ImageProcessingService = ImageProcessingService = ImageProcessingService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageProcessingService);
//# sourceMappingURL=image-processing.service.js.map