"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRelations = exports.notifications = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    notificationTypeId: (0, pg_core_1.bigserial)('notification_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    linkUrl: (0, pg_core_1.varchar)('link_url', { length: 500 }),
    isRead: (0, pg_core_1.boolean)('is_read').default(false).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    readAt: (0, pg_core_1.timestamp)('read_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('notifications_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('notifications_userId_idx').on(table.userId),
    isReadIdx: (0, pg_core_1.index)('notifications_is_read_idx').on(table.isRead),
}));
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.notifications.userId],
        references: [users_schema_1.users.id],
    }),
    notificationType: one(lookups_schema_1.lookups, {
        fields: [exports.notifications.notificationTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=notifications.schema.js.map