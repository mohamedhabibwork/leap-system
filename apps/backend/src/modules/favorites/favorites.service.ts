import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { eq, and } from 'drizzle-orm';
import { favorites } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class FavoritesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async toggle(userId: number, dto: CreateFavoriteDto) {
    // Check if favorite already exists
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, dto.favoritableType),
          eq(favorites.favoritableId, dto.favoritableId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);

    if (existing) {
      // Remove favorite (soft delete)
      await this.db
        .update(favorites)
        .set({ isDeleted: true, deletedAt: new Date() } as any)
        .where(eq(favorites.id, existing.id));
      return { favorited: false, favorite: null };
    } else {
      // Create favorite
      const [fav] = await this.db
        .insert(favorites)
        .values({ ...dto, userId: userId } as any)
        .returning();
      return { favorited: true, favorite: fav };
    }
  }

  async create(userId: number, dto: CreateFavoriteDto) {
    // Check if already exists
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, dto.favoritableType),
          eq(favorites.favoritableId, dto.favoritableId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);

    if (existing) {
      throw new BadRequestException('Already favorited');
    }

    const [fav] = await this.db.insert(favorites).values({ ...dto, userId: userId } as any).returning();
    return fav;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.isDeleted, false)));
  }

  async checkFavorite(userId: number, favoritableType: string, favoritableId: number): Promise<boolean> {
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, favoritableType),
          eq(favorites.favoritableId, favoritableId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);
    return !!existing;
  }

  async remove(userId: number, id: number) {
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(and(eq(favorites.id, id), eq(favorites.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.db
      .update(favorites)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(favorites.id, id));
    
    return { message: 'Favorite removed successfully' };
  }

  async removeByEntity(userId: number, favoritableType: string, favoritableId: number) {
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, favoritableType),
          eq(favorites.favoritableId, favoritableId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.db
      .update(favorites)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(favorites.id, existing.id));
    
    return { message: 'Favorite removed successfully' };
  }
}
