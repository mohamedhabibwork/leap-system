import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto } from './dto/bulk-page-operation.dto';
export declare class PagesService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreatePageDto & {
        createdBy: number;
    }): Promise<{
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
        categoryId: number;
        favoriteCount: number;
        coverImageUrl: string;
        createdBy: number;
        profileImageUrl: string;
        followerCount: number;
        likeCount: number;
    }>;
    findAllAdmin(query: AdminPageQueryDto): Promise<{
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
            categoryId: number;
            favoriteCount: number;
            coverImageUrl: string;
            createdBy: number;
            profileImageUrl: string;
            followerCount: number;
            likeCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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
        categoryId: number;
        favoriteCount: number;
        coverImageUrl: string;
        createdBy: number;
        profileImageUrl: string;
        followerCount: number;
        likeCount: number;
    }>;
    update(id: number, dto: UpdatePageDto): Promise<{
        id: number;
        uuid: string;
        name: string;
        slug: string;
        description: string;
        seo: unknown;
        categoryId: number;
        coverImageUrl: string;
        profileImageUrl: string;
        createdBy: number;
        followerCount: number;
        likeCount: number;
        favoriteCount: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    verifyPage(id: number, isVerified: boolean): Promise<{
        id: number;
        uuid: string;
        name: string;
        slug: string;
        description: string;
        seo: unknown;
        categoryId: number;
        coverImageUrl: string;
        profileImageUrl: string;
        createdBy: number;
        followerCount: number;
        likeCount: number;
        favoriteCount: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    setFeatured(id: number, isFeatured: boolean): Promise<{
        id: number;
        uuid: string;
        name: string;
        slug: string;
        description: string;
        seo: unknown;
        categoryId: number;
        coverImageUrl: string;
        profileImageUrl: string;
        createdBy: number;
        followerCount: number;
        likeCount: number;
        favoriteCount: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    getStatistics(): Promise<{
        total: number;
        verified: number;
        featured: number;
    }>;
    bulkOperation(dto: BulkPageOperationDto): Promise<{
        success: boolean;
        processedCount: number;
        failedCount: number;
        errors: {
            id: number;
            error: string;
        }[];
    }>;
    exportToCsv(query: AdminPageQueryDto): Promise<{
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
            categoryId: number;
            favoriteCount: number;
            coverImageUrl: string;
            createdBy: number;
            profileImageUrl: string;
            followerCount: number;
            likeCount: number;
        }[];
        format: string;
    }>;
}
//# sourceMappingURL=pages.service.d.ts.map