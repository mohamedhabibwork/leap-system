import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Tickets Table
export const tickets = pgTable('tickets', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  ticketNumber: varchar('ticket_number', { length: 100 }).notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  categoryId: bigserial('category_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  priorityId: bigserial('priority_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  description: text('description').notNull(),
  assignedTo: bigserial('assigned_to', { mode: 'number' }).references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('tickets_uuid_idx').on(table.uuid),
  ticketNumberIdx: index('tickets_ticket_number_idx').on(table.ticketNumber),
  userIdx: index('tickets_userId_idx').on(table.userId),
  assignedToIdx: index('tickets_assigned_to_idx').on(table.assignedTo),
}));

// Ticket Replies Table
export const ticketReplies = pgTable('ticket_replies', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  ticketId: bigserial('ticket_id', { mode: 'number' }).references(() => tickets.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('ticket_replies_uuid_idx').on(table.uuid),
  ticketIdx: index('ticket_replies_ticket_id_idx').on(table.ticketId),
  userIdx: index('ticket_replies_userId_idx').on(table.userId),
}));

// Reports Table
export const reports = pgTable('reports', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  reportedBy: bigserial('reported_by', { mode: 'number' }).references(() => users.id).notNull(),
  reportTypeId: bigserial('report_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  reportableType: varchar('reportable_type', { length: 50 }).notNull(),
  reportableId: bigserial('reportable_id', { mode: 'number' }).notNull(),
  reason: text('reason').notNull(),
  adminNotes: text('admin_notes'),
  reviewedBy: bigserial('reviewed_by', { mode: 'number' }).references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('reports_uuid_idx').on(table.uuid),
  reportedByIdx: index('reports_reported_by_idx').on(table.reportedBy),
  reportableIdx: index('reports_reportable_idx').on(table.reportableType, table.reportableId),
}));

// Relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
  }),
  category: one(lookups, {
    fields: [tickets.categoryId],
    references: [lookups.id],
  }),
  priority: one(lookups, {
    fields: [tickets.priorityId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [tickets.statusId],
    references: [lookups.id],
  }),
  replies: many(ticketReplies),
}));

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketReplies.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketReplies.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reportedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
  reportType: one(lookups, {
    fields: [reports.reportTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [reports.statusId],
    references: [lookups.id],
  }),
}));
