import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
export declare class SharesController {
    private readonly sharesService;
    constructor(sharesService: SharesService);
    create(user: any, dto: CreateShareDto): Promise<{
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
    findMy(user: any): Promise<{
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
//# sourceMappingURL=shares.controller.d.ts.map