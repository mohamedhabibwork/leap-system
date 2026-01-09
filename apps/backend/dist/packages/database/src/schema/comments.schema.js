"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentReactionsRelations = exports.commentsRelations = exports.commentReactions = exports.comments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.comments = (0, pg_core_1.pgTable)('comments', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    commentableType: (0, pg_core_1.varchar)('commentable_type', { length: 50 }).notNull(),
    commentableId: (0, pg_core_1.bigserial)('commentable_id', { mode: 'number' }).notNull(),
    parentCommentId: (0, pg_core_1.bigserial)('parent_comment_id', { mode: 'number' }).references(() => exports.comments.id),
    content: (0, pg_core_1.text)('content').notNull(),
    likesCount: (0, pg_core_1.integer)('likes_count').default(0),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('comments_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('comments_userId_idx').on(table.userId),
    commentableIdx: (0, pg_core_1.index)('comments_commentable_idx').on(table.commentableType, table.commentableId),
    parentIdx: (0, pg_core_1.index)('comments_parent_id_idx').on(table.parentCommentId),
}));
exports.commentReactions = (0, pg_core_1.pgTable)('comment_reactions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    commentId: (0, pg_core_1.bigserial)('comment_id', { mode: 'number' }).references(() => exports.comments.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    reactionTypeId: (0, pg_core_1.bigserial)('reaction_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('comment_reactions_uuid_idx').on(table.uuid),
    commentIdx: (0, pg_core_1.index)('comment_reactions_comment_id_idx').on(table.commentId),
    userIdx: (0, pg_core_1.index)('comment_reactions_userId_idx').on(table.userId),
}));
exports.commentsRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one, many }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.comments.userId],
        references: [users_schema_1.users.id],
    }),
    parent: one(exports.comments, {
        fields: [exports.comments.parentCommentId],
        references: [exports.comments.id],
    }),
    replies: many(exports.comments),
    reactions: many(exports.commentReactions),
}));
exports.commentReactionsRelations = (0, drizzle_orm_1.relations)(exports.commentReactions, ({ one }) => ({
    comment: one(exports.comments, {
        fields: [exports.commentReactions.commentId],
        references: [exports.comments.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.commentReactions.userId],
        references: [users_schema_1.users.id],
    }),
    reactionType: one(lookups_schema_1.lookups, {
        fields: [exports.commentReactions.reactionTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=comments.schema.js.map