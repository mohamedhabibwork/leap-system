"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRelations = exports.ticketRepliesRelations = exports.ticketsRelations = exports.reports = exports.ticketReplies = exports.tickets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.tickets = (0, pg_core_1.pgTable)('tickets', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    ticketNumber: (0, pg_core_1.varchar)('ticket_number', { length: 100 }).notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    categoryId: (0, pg_core_1.bigserial)('category_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    priorityId: (0, pg_core_1.bigserial)('priority_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 500 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    assignedTo: (0, pg_core_1.bigserial)('assigned_to', { mode: 'number' }).references(() => users_schema_1.users.id),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at', { withTimezone: true }),
    closedAt: (0, pg_core_1.timestamp)('closed_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('tickets_uuid_idx').on(table.uuid),
    ticketNumberIdx: (0, pg_core_1.index)('tickets_ticket_number_idx').on(table.ticketNumber),
    userIdx: (0, pg_core_1.index)('tickets_userId_idx').on(table.userId),
    assignedToIdx: (0, pg_core_1.index)('tickets_assigned_to_idx').on(table.assignedTo),
}));
exports.ticketReplies = (0, pg_core_1.pgTable)('ticket_replies', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    ticketId: (0, pg_core_1.bigserial)('ticket_id', { mode: 'number' }).references(() => exports.tickets.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    isInternal: (0, pg_core_1.boolean)('is_internal').default(false).notNull(),
    attachmentUrl: (0, pg_core_1.varchar)('attachment_url', { length: 500 }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('ticket_replies_uuid_idx').on(table.uuid),
    ticketIdx: (0, pg_core_1.index)('ticket_replies_ticket_id_idx').on(table.ticketId),
    userIdx: (0, pg_core_1.index)('ticket_replies_userId_idx').on(table.userId),
}));
exports.reports = (0, pg_core_1.pgTable)('reports', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    reportedBy: (0, pg_core_1.bigserial)('reported_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    reportTypeId: (0, pg_core_1.bigserial)('report_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    reportableType: (0, pg_core_1.varchar)('reportable_type', { length: 50 }).notNull(),
    reportableId: (0, pg_core_1.bigserial)('reportable_id', { mode: 'number' }).notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    adminNotes: (0, pg_core_1.text)('admin_notes'),
    reviewedBy: (0, pg_core_1.bigserial)('reviewed_by', { mode: 'number' }).references(() => users_schema_1.users.id),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('reports_uuid_idx').on(table.uuid),
    reportedByIdx: (0, pg_core_1.index)('reports_reported_by_idx').on(table.reportedBy),
    reportableIdx: (0, pg_core_1.index)('reports_reportable_idx').on(table.reportableType, table.reportableId),
}));
exports.ticketsRelations = (0, drizzle_orm_1.relations)(exports.tickets, ({ one, many }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.tickets.userId],
        references: [users_schema_1.users.id],
    }),
    assignee: one(users_schema_1.users, {
        fields: [exports.tickets.assignedTo],
        references: [users_schema_1.users.id],
    }),
    category: one(lookups_schema_1.lookups, {
        fields: [exports.tickets.categoryId],
        references: [lookups_schema_1.lookups.id],
    }),
    priority: one(lookups_schema_1.lookups, {
        fields: [exports.tickets.priorityId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.tickets.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    replies: many(exports.ticketReplies),
}));
exports.ticketRepliesRelations = (0, drizzle_orm_1.relations)(exports.ticketReplies, ({ one }) => ({
    ticket: one(exports.tickets, {
        fields: [exports.ticketReplies.ticketId],
        references: [exports.tickets.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.ticketReplies.userId],
        references: [users_schema_1.users.id],
    }),
}));
exports.reportsRelations = (0, drizzle_orm_1.relations)(exports.reports, ({ one }) => ({
    reporter: one(users_schema_1.users, {
        fields: [exports.reports.reportedBy],
        references: [users_schema_1.users.id],
    }),
    reviewer: one(users_schema_1.users, {
        fields: [exports.reports.reviewedBy],
        references: [users_schema_1.users.id],
    }),
    reportType: one(lookups_schema_1.lookups, {
        fields: [exports.reports.reportTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.reports.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=tickets.schema.js.map