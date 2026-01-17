import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { eq, and, or, inArray, sql, desc } from 'drizzle-orm';
import { favorites, posts, groups, pages, events, users, courses } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

@Injectable()
export class FavoritesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

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
        .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof favorites>>)
        .where(eq(favorites.id, existing.id));
      return { favorited: false, favorite: null };
    } else {
      // Create favorite
      const [fav] = await this.db
        .insert(favorites)
        .values({ ...dto, userId: userId } as InferInsertModel<typeof favorites>)
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
        .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof favorites>>)
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
        .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof favorites>>)
      .where(eq(favorites.id, existing.id));
    
    return { message: 'Favorite removed successfully' };
  }

  async findByUserWithEntities(userId: number, query?: { type?: string; page?: number; limit?: number }) {
    const { type, page = 1, limit = 20 } = query || {};
    const offset = (page - 1) * limit;

    const conditions = [
      eq(favorites.userId, userId),
      eq(favorites.isDeleted, false),
    ];

    if (type) {
      conditions.push(eq(favorites.favoritableType, type));
    }

    const userFavorites = await this.db
      .select()
      .from(favorites)
      .where(and(...conditions))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    // Group favorites by type
    const favoritesByType: Record<string, number[]> = {};
    userFavorites.forEach((fav) => {
      if (!favoritesByType[fav.favoritableType]) {
        favoritesByType[fav.favoritableType] = [];
      }
      favoritesByType[fav.favoritableType].push(fav.favoritableId);
    });

    // Fetch entities for each type
    const entities: any[] = [];

    // Fetch posts
    if (favoritesByType['post'] && favoritesByType['post'].length > 0) {
      const postEntities = await this.db
        .select()
        .from(posts)
        .where(
          and(
            inArray(posts.id, favoritesByType['post']),
            eq(posts.isDeleted, false)
          )
        );
      entities.push(...postEntities.map((p) => ({ ...p, _favoriteType: 'post' })));
    }

    // Fetch groups
    if (favoritesByType['group'] && favoritesByType['group'].length > 0) {
      const groupEntities = await this.db
        .select()
        .from(groups)
        .where(
          and(
            inArray(groups.id, favoritesByType['group']),
            eq(groups.isDeleted, false)
          )
        );
      entities.push(...groupEntities.map((g) => ({ ...g, _favoriteType: 'group' })));
    }

    // Fetch pages
    if (favoritesByType['page'] && favoritesByType['page'].length > 0) {
      const pageEntities = await this.db
        .select()
        .from(pages)
        .where(
          and(
            inArray(pages.id, favoritesByType['page']),
            eq(pages.isDeleted, false)
          )
        );
      entities.push(...pageEntities.map((p) => ({ ...p, _favoriteType: 'page' })));
    }

    // Fetch events
    if (favoritesByType['event'] && favoritesByType['event'].length > 0) {
      const eventEntities = await this.db
        .select()
        .from(events)
        .where(
          and(
            inArray(events.id, favoritesByType['event']),
            eq(events.isDeleted, false)
          )
        );
      entities.push(...eventEntities.map((e) => ({ ...e, _favoriteType: 'event' })));
    }

    // Fetch users
    if (favoritesByType['user'] && favoritesByType['user'].length > 0) {
      const userEntities = await this.db
        .select()
        .from(users)
        .where(
          and(
            inArray(users.id, favoritesByType['user']),
            eq(users.isActive, true)
          )
        );
      entities.push(...userEntities.map((u) => ({ ...u, _favoriteType: 'user' })));
    }

    // Fetch courses
    if (favoritesByType['course'] && favoritesByType['course'].length > 0) {
      const courseEntities = await this.db
        .select()
        .from(courses)
        .where(
          and(
            inArray(courses.id, favoritesByType['course']),
            eq(courses.isDeleted, false)
          )
        );
      entities.push(...courseEntities.map((c) => ({ ...c, _favoriteType: 'course' })));
    }

    // Map favorites to entities
    const result = userFavorites
      .map((fav) => {
        const entity = entities.find(
          (e) => e.id === fav.favoritableId && e._favoriteType === fav.favoritableType
        );
        if (entity) {
          const { _favoriteType, ...entityData } = entity;
          return {
            favorite: fav,
            entity: entityData,
            type: fav.favoritableType,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(and(...conditions));

    return {
      data: result,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findByType(userId: number, favoritableType: string, query?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query || {};
    const offset = (page - 1) * limit;

    const conditions = [
      eq(favorites.userId, userId),
      eq(favorites.favoritableType, favoritableType),
      eq(favorites.isDeleted, false),
    ];

    const userFavorites = await this.db
      .select()
      .from(favorites)
      .where(and(...conditions))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    const entityIds = userFavorites.map((f) => f.favoritableId);

    if (entityIds.length === 0) {
      const [{ count }] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(favorites)
        .where(and(...conditions));
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    }

    let entities: any[] = [];

    switch (favoritableType) {
      case 'post':
        entities = await this.db
          .select()
          .from(posts)
          .where(and(inArray(posts.id, entityIds), eq(posts.isDeleted, false)));
        break;
      case 'group':
        entities = await this.db
          .select()
          .from(groups)
          .where(and(inArray(groups.id, entityIds), eq(groups.isDeleted, false)));
        break;
      case 'page':
        entities = await this.db
          .select()
          .from(pages)
          .where(and(inArray(pages.id, entityIds), eq(pages.isDeleted, false)));
        break;
      case 'event':
        entities = await this.db
          .select()
          .from(events)
          .where(and(inArray(events.id, entityIds), eq(events.isDeleted, false)));
        break;
      case 'user':
        entities = await this.db
          .select()
          .from(users)
          .where(and(inArray(users.id, entityIds), eq(users.isActive, true)));
        break;
      case 'course':
        entities = await this.db
          .select()
          .from(courses)
          .where(and(inArray(courses.id, entityIds), eq(courses.isDeleted, false)));
        break;
      default:
        entities = [];
    }

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(and(...conditions));

    return {
      data: entities,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async bulkCheckFavorite(userId: number, items: Array<{ type: string; id: number }>) {
    if (items.length === 0) {
      return {};
    }

    // Group items by type
    const itemsByType: Record<string, number[]> = {};
    items.forEach((item) => {
      if (!itemsByType[item.type]) {
        itemsByType[item.type] = [];
      }
      itemsByType[item.type].push(item.id);
    });

    // Build OR conditions for all items
    const orConditions = items.map((item) =>
      and(
        eq(favorites.favoritableType, item.type),
        eq(favorites.favoritableId, item.id)
      )
    );

    const userFavorites = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.isDeleted, false),
          or(...orConditions)
        )
      );

    // Create a map of favorited items
    const favoritedMap: Record<string, boolean> = {};
    userFavorites.forEach((fav) => {
      const key = `${fav.favoritableType}:${fav.favoritableId}`;
      favoritedMap[key] = true;
    });

    // Build result object
    const result: Record<string, boolean> = {};
    items.forEach((item) => {
      const key = `${item.type}:${item.id}`;
      result[key] = favoritedMap[key] || false;
    });

    return result;
  }
}
