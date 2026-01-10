import { pgTable, bigserial, bigint, text, varchar, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * FCM Tokens Table
 * Stores Firebase Cloud Messaging tokens for push notifications
 * Supports multiple devices per user
 */
export const fcmTokens = pgTable('fcm_tokens', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').unique().notNull(),
  deviceType: varchar('device_type', { length: 20 }), // 'web', 'android', 'ios'
  deviceInfo: jsonb('device_info'), // Browser info, OS, device name, etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('fcm_tokens_user_id_idx').on(table.userId),
  tokenIdx: index('fcm_tokens_token_idx').on(table.token),
  isActiveIdx: index('fcm_tokens_is_active_idx').on(table.isActive),
}));

/**
 * Relations
 */
export const fcmTokensRelations = relations(fcmTokens, ({ one }) => ({
  user: one(users, {
    fields: [fcmTokens.userId],
    references: [users.id],
  }),
}));

// Export type
export type FCMToken = typeof fcmTokens.$inferSelect;
export type NewFCMToken = typeof fcmTokens.$inferInsert;
