import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private configService;
    private minioClient;
    private bucketName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        key: string;
    }>;
    deleteFile(key: string): Promise<void>;
    getPresignedUrl(key: string, expirySeconds?: number): Promise<string>;
}
//# sourceMappingURL=minio.service.d.ts.map