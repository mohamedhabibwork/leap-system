import { pgTable, bigserial, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// Favorites Table (Universal/Polymorphic)
export const favorites = pgTable('favorites', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  favoritableType: varchar('favoritable_type', { length: 50 }).notNull(),
  favoritableId: bigserial('favoritable_id', { mode: 'number' }).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('favorites_uuid_idx').on(table.uuid),
  userIdx: index('favorites_userId_idx').on(table.userId),
  favoritableIdx: index('favorites_favoritable_idx').on(table.favoritableType, table.favoritableId),
}));

// Relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));
