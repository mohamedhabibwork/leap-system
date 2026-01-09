"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharesRelations = exports.shares = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
const social_schema_1 = require("./social.schema");
exports.shares = (0, pg_core_1.pgTable)('shares', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    shareableType: (0, pg_core_1.varchar)('shareable_type', { length: 50 }).notNull(),
    shareableId: (0, pg_core_1.bigserial)('shareable_id', { mode: 'number' }).notNull(),
    shareTypeId: (0, pg_core_1.bigserial)('share_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    sharedToGroupId: (0, pg_core_1.bigserial)('shared_to_group_id', { mode: 'number' }).references(() => social_schema_1.groups.id),
    externalPlatform: (0, pg_core_1.varchar)('external_platform', { length: 50 }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('shares_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('shares_userId_idx').on(table.userId),
    shareableIdx: (0, pg_core_1.index)('shares_shareable_idx').on(table.shareableType, table.shareableId),
}));
exports.sharesRelations = (0, drizzle_orm_1.relations)(exports.shares, ({ one }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.shares.userId],
        references: [users_schema_1.users.id],
    }),
    shareType: one(lookups_schema_1.lookups, {
        fields: [exports.shares.shareTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    sharedToGroup: one(social_schema_1.groups, {
        fields: [exports.shares.sharedToGroupId],
        references: [social_schema_1.groups.id],
    }),
}));
//# sourceMappingURL=shares.schema.js.map