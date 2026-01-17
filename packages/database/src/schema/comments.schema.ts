import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Comments Table (Universal/Polymorphic)
// @ts-expect-error - Self-referencing table: TypeScript cannot infer type due to circular reference in parentCommentId. This is a known limitation with Drizzle ORM self-references.
export const comments = pgTable('comments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  commentableType: varchar('commentable_type', { length: 50 }).notNull(),
  commentableId: bigserial('commentable_id', { mode: 'number' }).notNull(),
  // @ts-expect-error - Self-referencing table: TypeScript cannot infer type due to circular reference. This is a known limitation with Drizzle ORM self-references.
  parentCommentId: bigserial('parent_comment_id', { mode: 'number' }).references(() => comments.id),
  content: text('content').notNull(),
  likesCount: integer('likes_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('comments_uuid_idx').on(table.uuid),
  userIdx: index('comments_userId_idx').on(table.userId),
  commentableIdx: index('comments_commentable_idx').on(table.commentableType, table.commentableId),
  parentIdx: index('comments_parent_id_idx').on(table.parentCommentId),
}));

// Comment Reactions Table
export const commentReactions = pgTable('comment_reactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  commentId: bigserial('comment_id', { mode: 'number' }).references(() => comments.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  reactionTypeId: bigserial('reaction_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('comment_reactions_uuid_idx').on(table.uuid),
  commentIdx: index('comment_reactions_comment_id_idx').on(table.commentId),
  userIdx: index('comment_reactions_userId_idx').on(table.userId),
}));

// Relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  replies: many(comments),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
  reactionType: one(lookups, {
    fields: [commentReactions.reactionTypeId],
    references: [lookups.id],
  }),
}));
