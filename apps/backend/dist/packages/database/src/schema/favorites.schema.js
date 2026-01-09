"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoritesRelations = exports.favorites = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
exports.favorites = (0, pg_core_1.pgTable)('favorites', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    favoritableType: (0, pg_core_1.varchar)('favoritable_type', { length: 50 }).notNull(),
    favoritableId: (0, pg_core_1.bigserial)('favoritable_id', { mode: 'number' }).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('favorites_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('favorites_userId_idx').on(table.userId),
    favoritableIdx: (0, pg_core_1.index)('favorites_favoritable_idx').on(table.favoritableType, table.favoritableId),
}));
exports.favoritesRelations = (0, drizzle_orm_1.relations)(exports.favorites, ({ one }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.favorites.userId],
        references: [users_schema_1.users.id],
    }),
}));
//# sourceMappingURL=favorites.schema.js.map