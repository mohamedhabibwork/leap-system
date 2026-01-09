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
    update(id: number, dto: UpdateGroupDto): Promise<{
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
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=groups.service.d.ts.map