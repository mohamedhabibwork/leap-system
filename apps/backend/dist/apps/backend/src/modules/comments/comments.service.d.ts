import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class CommentsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(userId: number, createCommentDto: CreateCommentDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        userId: number;
        commentableType: string;
        commentableId: number;
        parentCommentId: number;
        content: string;
        likesCount: number;
    }>;
    findByCommentable(type: string, id: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        userId: number;
        commentableType: string;
        commentableId: number;
        parentCommentId: number;
        content: string;
        likesCount: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        userId: number;
        commentableType: string;
        commentableId: number;
        parentCommentId: number;
        content: string;
        likesCount: number;
    }>;
    update(id: number, updateCommentDto: UpdateCommentDto): Promise<{
        id: number;
        uuid: string;
        userId: number;
        commentableType: string;
        commentableId: number;
        parentCommentId: number;
        content: string;
        likesCount: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=comments.service.d.ts.map