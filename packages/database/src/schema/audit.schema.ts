import { pgTable, bigserial, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id),
  auditableType: varchar('auditable_type', { length: 50 }).notNull(),
  auditableId: bigserial('auditable_id', { mode: 'number' }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  description: text('description'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('audit_logs_uuid_idx').on(table.uuid),
  userIdx: index('audit_logs_userId_idx').on(table.userId),
  auditableIdx: index('audit_logs_auditable_idx').on(table.auditableType, table.auditableId),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  createdAtIdx: index('audit_logs_createdAt_idx').on(table.createdAt),
}));

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
