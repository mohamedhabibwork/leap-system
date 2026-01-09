import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class FavoritesService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(userId: number, dto: CreateFavoriteDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        favoritableType: string;
        favoritableId: number;
    }>;
    findByUser(userId: number): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        favoritableType: string;
        favoritableId: number;
    }[]>;
    remove(userId: number, id: number): Promise<void>;
}
//# sourceMappingURL=favorites.service.d.ts.map