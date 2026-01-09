import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class R2Service implements OnModuleInit {
    private configService;
    private s3Client;
    private bucketName;
    private publicUrl;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        key: string;
    }>;
    deleteFile(key: string): Promise<void>;
    getPresignedUrl(key: string, expirySeconds?: number): Promise<string>;
    getFile(key: string): Promise<Buffer>;
}
//# sourceMappingURL=r2.service.d.ts.map