"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsRelations = exports.auditLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id),
    auditableType: (0, pg_core_1.varchar)('auditable_type', { length: 50 }).notNull(),
    auditableId: (0, pg_core_1.bigserial)('auditable_id', { mode: 'number' }).notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 50 }).notNull(),
    oldValues: (0, pg_core_1.jsonb)('old_values'),
    newValues: (0, pg_core_1.jsonb)('new_values'),
    description: (0, pg_core_1.text)('description'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('audit_logs_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('audit_logs_userId_idx').on(table.userId),
    auditableIdx: (0, pg_core_1.index)('audit_logs_auditable_idx').on(table.auditableType, table.auditableId),
    actionIdx: (0, pg_core_1.index)('audit_logs_action_idx').on(table.action),
    createdAtIdx: (0, pg_core_1.index)('audit_logs_createdAt_idx').on(table.createdAt),
}));
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, ({ one }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.auditLogs.userId],
        references: [users_schema_1.users.id],
    }),
}));
//# sourceMappingURL=audit.schema.js.map