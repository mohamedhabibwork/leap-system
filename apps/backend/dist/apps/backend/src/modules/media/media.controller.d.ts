import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    create(createMediaDto: CreateMediaDto): Promise<any>;
    findAll(): Promise<any[]>;
    findByUploadable(type: string, id: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateMediaDto: UpdateMediaDto): Promise<any>;
    trackDownload(id: number): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<void>;
    cleanupTemporary(): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=media.controller.d.ts.map