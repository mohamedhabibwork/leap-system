import { CreateMediaDto, UpdateMediaDto } from './dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class MediaService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(createMediaDto: CreateMediaDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    findByUploadable(uploadableType: string, uploadableId: number): Promise<any[]>;
    update(id: number, updateMediaDto: UpdateMediaDto): Promise<any>;
    incrementDownloadCount(id: number): Promise<void>;
    remove(id: number): Promise<void>;
    cleanupTemporaryFiles(): Promise<number>;
    private detectMediaType;
}
//# sourceMappingURL=media.service.d.ts.map