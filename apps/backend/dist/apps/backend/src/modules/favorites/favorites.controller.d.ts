import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(user: any, dto: CreateFavoriteDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        favoritableType: string;
        favoritableId: number;
    }>;
    findMy(user: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        favoritableType: string;
        favoritableId: number;
    }[]>;
    remove(user: any, id: number): Promise<void>;
}
//# sourceMappingURL=favorites.controller.d.ts.map