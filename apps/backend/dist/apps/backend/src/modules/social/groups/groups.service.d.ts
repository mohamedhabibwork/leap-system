import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class GroupsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreateGroupDto): Promise<{
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
    update(id: number, dto: UpdateGroupDto, userId?: number): Promise<{
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
    remove(id: number, userId?: number): Promise<void>;
    findAllAdmin(query: any): Promise<{
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
    joinGroup(groupId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    leaveGroup(groupId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getMembers(groupId: number, query: any): Promise<{
        data: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    addMember(groupId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    approveGroup(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectGroup(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    setFeatured(id: number, featured: boolean): Promise<{
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
    bulkOperation(dto: any): Promise<{
        message: string;
    }>;
    exportToCsv(query: any): Promise<string>;
}
//# sourceMappingURL=groups.service.d.ts.map