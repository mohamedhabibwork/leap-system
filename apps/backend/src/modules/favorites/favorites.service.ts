import { Injectable, Inject } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { eq, and } from 'drizzle-orm';
import { favorites } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class FavoritesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(userId: number, dto: CreateFavoriteDto) {
    const [fav] = await this.db.insert(favorites).values({ ...dto, userId: userId } as any).returning();
    return fav;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.isDeleted, false)));
  }

  async remove(userId: number, id: number) {
    await this.db.delete(favorites).where(and(eq(favorites.id, id), eq(favorites.userId, userId)));
  }
}
