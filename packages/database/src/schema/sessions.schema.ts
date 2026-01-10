import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Sessions Table
 * Stores user session data including Keycloak tokens for SSO support
 */
export const sessions = pgTable('sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  
  // User reference
  userId: bigserial('user_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Session token (used in cookie)
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  
  // Keycloak tokens
  accessToken: text('access_token').notNull(), // Keycloak access token (JWT)
  refreshToken: text('refresh_token').notNull(), // Keycloak refresh token
  keycloakSessionId: varchar('keycloak_session_id', { length: 255 }), // Keycloak session ID
  
  // Token expiration
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // When the session expires
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }).notNull(), // When access token expires
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }).notNull(), // When refresh token expires
  
  // Session metadata
  userAgent: text('user_agent'), // Browser/client user agent
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6 address
  deviceInfo: text('device_info'), // Additional device information (JSON)
  
  // Session state
  isActive: boolean('is_active').default(true).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
  
  // Remember me
  rememberMe: boolean('remember_me').default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ([
  // Indexes for performance
  index('sessions_uuid_idx').on(table.uuid),
  index('sessions_user_id_idx').on(table.userId),
  index('sessions_session_token_idx').on(table.sessionToken),
  index('sessions_keycloak_session_id_idx').on(table.keycloakSessionId),
  index('sessions_expires_at_idx').on(table.expiresAt),
  index('sessions_is_active_idx').on(table.isActive),
  index('sessions_last_activity_at_idx').on(table.lastActivityAt),
  // Composite index for user + active sessions
  index('sessions_user_active_idx').on(table.userId, table.isActive),
]));

/**
 * Session Relations
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/**
 * Type exports for TypeScript
 */
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
