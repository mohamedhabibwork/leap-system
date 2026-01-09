import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AdminGroupQueryDto } from './dto/admin-group-query.dto';
import { BulkGroupOperationDto } from './dto/bulk-group-operation.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(createGroupDto: CreateGroupDto, user: any): Promise<{
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
    findAll(query: AdminGroupQueryDto): Promise<{
        data: {
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
        }[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getStatistics(): Promise<{
        total: number;
        public: number;
        private: number;
    }>;
    findOne(id: number): Promise<{
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
    joinGroup(id: number, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    leaveGroup(id: number, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMembers(id: number, query: any): Promise<{
        data: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    addMember(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    approve(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    reject(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    feature(id: number): Promise<{
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
    unfeature(id: number): Promise<{
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
    update(id: number, updateGroupDto: UpdateGroupDto, user: any): Promise<{
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
    remove(id: number, user: any): Promise<void>;
    bulkOperation(dto: BulkGroupOperationDto): Promise<{
        message: string;
    }>;
    export(query: AdminGroupQueryDto): Promise<string>;
}
//# sourceMappingURL=groups.controller.d.ts.map