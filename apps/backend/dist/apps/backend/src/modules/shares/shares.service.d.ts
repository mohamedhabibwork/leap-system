import { CreateShareDto } from './dto/create-share.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class SharesService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(userId: number, dto: CreateShareDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        shareableType: string;
        shareableId: number;
        shareTypeId: number;
        sharedToGroupId: number;
        externalPlatform: string;
    }>;
    findByUser(userId: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        shareableType: string;
        shareableId: number;
        shareTypeId: number;
        sharedToGroupId: number;
        externalPlatform: string;
    }[]>;
    findByShareable(type: string, id: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        shareableType: string;
        shareableId: number;
        shareTypeId: number;
        sharedToGroupId: number;
        externalPlatform: string;
    }[]>;
}
//# sourceMappingURL=shares.service.d.ts.map