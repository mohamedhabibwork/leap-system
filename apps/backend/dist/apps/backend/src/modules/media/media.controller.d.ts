import { MediaService } from './media.service';
import { MinioService } from './minio.service';
import { R2Service } from './r2.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import { ConfigService } from '@nestjs/config';
export declare class MediaController {
    private readonly mediaService;
    private readonly minioService;
    private readonly r2Service;
    private readonly configService;
    private storageProvider;
    constructor(mediaService: MediaService, minioService: MinioService, r2Service: R2Service, configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        key: string;
    }>;
    create(createMediaDto: CreateMediaDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByUploadable(type: string, id: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateMediaDto: UpdateMediaDto): Promise<any>;
    trackDownload(id: number): Promise<{
        message: string;
    }>;
    deleteFile(key: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<void>;
    cleanupTemporary(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=media.controller.d.ts.map