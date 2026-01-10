import { pgTable, bigserial, uuid, varchar, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// User Notification Preferences Table
export const userNotificationPreferences = pgTable('user_notification_preferences', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('user_id', { mode: 'number' }).references(() => users.id).notNull().unique(),
  
  // Global toggles
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  websocketEnabled: boolean('websocket_enabled').default(true).notNull(),
  
  // Granular social preferences
  notifyOnPostLikes: boolean('notify_on_post_likes').default(true).notNull(),
  notifyOnComments: boolean('notify_on_comments').default(true).notNull(),
  notifyOnCommentReplies: boolean('notify_on_comment_replies').default(true).notNull(),
  notifyOnShares: boolean('notify_on_shares').default(true).notNull(),
  notifyOnFriendRequests: boolean('notify_on_friend_requests').default(true).notNull(),
  notifyOnFriendRequestAccepted: boolean('notify_on_friend_request_accepted').default(true).notNull(),
  notifyOnGroupJoins: boolean('notify_on_group_joins').default(true).notNull(),
  notifyOnPageFollows: boolean('notify_on_page_follows').default(true).notNull(),
  notifyOnMentions: boolean('notify_on_mentions').default(true).notNull(),
  notifyOnEventInvitations: boolean('notify_on_event_invitations').default(true).notNull(),
  
  // Category preferences (JSONB for flexible channel configuration)
  categories: jsonb('categories').$type<{
    social: { email: boolean; push: boolean; websocket: boolean };
    lms: { email: boolean; push: boolean; websocket: boolean };
    jobs: { email: boolean; push: boolean; websocket: boolean };
    events: { email: boolean; push: boolean; websocket: boolean };
    payments: { email: boolean; push: boolean; websocket: boolean };
    system: { email: boolean; push: boolean; websocket: boolean };
  }>().default({
    social: { email: true, push: true, websocket: true },
    lms: { email: true, push: true, websocket: true },
    jobs: { email: true, push: true, websocket: true },
    events: { email: true, push: true, websocket: true },
    payments: { email: true, push: true, websocket: true },
    system: { email: true, push: true, websocket: true },
  }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uuidIdx: index('user_notification_preferences_uuid_idx').on(table.uuid),
  userIdx: index('user_notification_preferences_user_id_idx').on(table.userId),
}));

// Relations
export const userNotificationPreferencesRelations = relations(userNotificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPreferences.userId],
    references: [users.id],
  }),
}));
