import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(createGroupDto: CreateGroupDto): Promise<{
        description: string;
        id: number;
        uuid: string;
        name: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        slug: string;
        seo: unknown;
        favoriteCount: number;
        privacyTypeId: number;
        coverImageUrl: string;
        createdBy: number;
        memberCount: number;
    }>;
    findAll(): Promise<{
        description: string;
        id: number;
        uuid: string;
        name: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        slug: string;
        seo: unknown;
        favoriteCount: number;
        privacyTypeId: number;
        coverImageUrl: string;
        createdBy: number;
        memberCount: number;
    }[]>;
    findOne(id: string): Promise<{
        description: string;
        id: number;
        uuid: string;
        name: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        slug: string;
        seo: unknown;
        favoriteCount: number;
        privacyTypeId: number;
        coverImageUrl: string;
        createdBy: number;
        memberCount: number;
    }>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<{
        id: number;
        uuid: string;
        name: string;
        slug: string;
        description: string;
        seo: unknown;
        privacyTypeId: number;
        coverImageUrl: string;
        createdBy: number;
        memberCount: number;
        favoriteCount: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=groups.controller.d.ts.map