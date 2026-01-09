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
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const minio_1 = require("minio");
const config_1 = require("@nestjs/config");
let MinioService = class MinioService {
    configService;
    minioClient;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'leap-lms';
        this.minioClient = new minio_1.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
            port: parseInt(this.configService.get('MINIO_PORT') || '9000'),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get('MINIO_SECRET_KEY'),
        });
    }
    async onModuleInit() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`Created bucket: ${this.bucketName}`);
            }
        }
        catch (error) {
            console.error('MinIO initialization error:', error);
        }
    }
    async uploadFile(file, folder) {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, { 'Content-Type': file.mimetype });
        const publicUrl = this.configService.get('MINIO_PUBLIC_URL') || 'http://localhost:9000';
        return {
            url: `${publicUrl}/${this.bucketName}/${fileName}`,
            key: fileName,
        };
    }
    async deleteFile(key) {
        await this.minioClient.removeObject(this.bucketName, key);
    }
    async getPresignedUrl(key, expirySeconds = 3600) {
        return await this.minioClient.presignedGetObject(this.bucketName, key, expirySeconds);
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map