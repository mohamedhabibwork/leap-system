import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Notifications Table
export const notifications = pgTable('notifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  notificationTypeId: bigserial('notification_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  linkUrl: varchar('link_url', { length: 500 }),
  isRead: boolean('is_read').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('notifications_uuid_idx').on(table.uuid),
  userIdx: index('notifications_userId_idx').on(table.userId),
  isReadIdx: index('notifications_is_read_idx').on(table.isRead),
}));

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  notificationType: one(lookups, {
    fields: [notifications.notificationTypeId],
    references: [lookups.id],
  }),
}));
