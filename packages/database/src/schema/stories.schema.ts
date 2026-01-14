import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// Stories Table
export const stories = pgTable('stories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  mediaUrl: varchar('media_url', { length: 500 }).notNull(),
  mediaType: varchar('media_type', { length: 50 }).default('image'), // image, video
  content: text('content'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isArchived: boolean('isArchived').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('stories_uuid_idx').on(table.uuid),
  index('stories_userId_idx').on(table.userId),
  index('stories_expires_at_idx').on(table.expiresAt),
]));

// Story Views Table
export const storyViews = pgTable('story_views', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  storyId: bigserial('story_id', { mode: 'number' }).references(() => stories.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ([    
  index('story_views_story_id_idx').on(table.storyId),
  index('story_views_userId_idx').on(table.userId),
  index('story_views_story_user_unique_idx').on(table.storyId, table.userId),
]));

// Relations
export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  views: many(storyViews),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, {
    fields: [storyViews.storyId],
    references: [stories.id],
  }),
  user: one(users, {
    fields: [storyViews.userId],
    references: [users.id],
  }),
}));
