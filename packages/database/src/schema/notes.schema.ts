import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Notes Table (Polymorphic)
export const notes = pgTable('notes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  noteableType: varchar('noteable_type', { length: 50 }).notNull(),
  noteableId: bigserial('noteable_id', { mode: 'number' }).notNull(),
  visibilityId: bigserial('visibility_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  content: text('content').notNull(),
  color: varchar('color', { length: 20 }),
  likesCount: integer('likes_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('notes_uuid_idx').on(table.uuid),
  userIdx: index('notes_userId_idx').on(table.userId),
  noteableIdx: index('notes_noteable_idx').on(table.noteableType, table.noteableId),
}));

// Relations
export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  visibility: one(lookups, {
    fields: [notes.visibilityId],
    references: [lookups.id],
  }),
}));
