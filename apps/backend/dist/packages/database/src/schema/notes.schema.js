"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesRelations = exports.notes = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.notes = (0, pg_core_1.pgTable)('notes', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    noteableType: (0, pg_core_1.varchar)('noteable_type', { length: 50 }).notNull(),
    noteableId: (0, pg_core_1.bigserial)('noteable_id', { mode: 'number' }).notNull(),
    visibilityId: (0, pg_core_1.bigserial)('visibility_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    isPinned: (0, pg_core_1.boolean)('is_pinned').default(false).notNull(),
    isArchived: (0, pg_core_1.boolean)('is_archived').default(false).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    likesCount: (0, pg_core_1.integer)('likes_count').default(0),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    archivedAt: (0, pg_core_1.timestamp)('archived_at', { withTimezone: true }),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('notes_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('notes_userId_idx').on(table.userId),
    noteableIdx: (0, pg_core_1.index)('notes_noteable_idx').on(table.noteableType, table.noteableId),
}));
exports.notesRelations = (0, drizzle_orm_1.relations)(exports.notes, ({ one }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.notes.userId],
        references: [users_schema_1.users.id],
    }),
    visibility: one(lookups_schema_1.lookups, {
        fields: [exports.notes.visibilityId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=notes.schema.js.map