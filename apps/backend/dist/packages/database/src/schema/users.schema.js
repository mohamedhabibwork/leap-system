"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissionsRelations = exports.userRolesRelations = exports.usersRelations = exports.rolePermissions = exports.userRoles = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const lookups_schema_1 = require("./lookups.schema");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).notNull().unique(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    keycloakUserId: (0, pg_core_1.varchar)('keycloak_user_id', { length: 255 }).unique(),
    firstName: (0, pg_core_1.varchar)('firstName', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('lastName', { length: 100 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    bio: (0, pg_core_1.text)('bio'),
    avatarUrl: (0, pg_core_1.varchar)('avatar_url', { length: 500 }),
    resumeUrl: (0, pg_core_1.varchar)('resume_url', { length: 500 }),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    preferredLanguage: (0, pg_core_1.varchar)('preferred_language', { length: 5 }).default('en'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }),
    emailVerifiedAt: (0, pg_core_1.timestamp)('email_verified_at', { withTimezone: true }),
    emailVerificationToken: (0, pg_core_1.varchar)('email_verification_token', { length: 255 }),
    passwordResetToken: (0, pg_core_1.varchar)('password_reset_token', { length: 255 }),
    passwordResetExpiry: (0, pg_core_1.timestamp)('password_reset_expiry', { withTimezone: true }),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at', { withTimezone: true }),
    isOnline: (0, pg_core_1.boolean)('isOnline').default(false).notNull(),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('users_uuid_idx').on(table.uuid),
    emailIdx: (0, pg_core_1.index)('users_email_idx').on(table.email),
    usernameIdx: (0, pg_core_1.index)('users_username_idx').on(table.username),
    roleIdx: (0, pg_core_1.index)('users_role_id_idx').on(table.roleId),
    statusIdx: (0, pg_core_1.index)('users_status_id_idx').on(table.statusId),
    emailVerificationTokenIdx: (0, pg_core_1.index)('users_email_verification_token_idx').on(table.emailVerificationToken),
    passwordResetTokenIdx: (0, pg_core_1.index)('users_password_reset_token_idx').on(table.passwordResetToken),
    keycloakUserIdIdx: (0, pg_core_1.index)('users_keycloak_user_id_idx').on(table.keycloakUserId),
}));
exports.userRoles = (0, pg_core_1.pgTable)('user_roles', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    userId: (0, pg_core_1.bigserial)('user_id', { mode: 'number' }).references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id, { onDelete: 'cascade' }).notNull(),
    assignedAt: (0, pg_core_1.timestamp)('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedBy: (0, pg_core_1.bigserial)('assigned_by', { mode: 'number' }).references(() => exports.users.id),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('user_roles_user_id_idx').on(table.userId),
    roleIdIdx: (0, pg_core_1.index)('user_roles_role_id_idx').on(table.roleId),
    userRoleUniqueIdx: (0, pg_core_1.index)('user_roles_user_role_unique_idx').on(table.userId, table.roleId),
}));
exports.rolePermissions = (0, pg_core_1.pgTable)('role_permissions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id, { onDelete: 'cascade' }).notNull(),
    permissionId: (0, pg_core_1.bigserial)('permission_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id, { onDelete: 'cascade' }).notNull(),
    isGranted: (0, pg_core_1.boolean)('is_granted').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    roleIdIdx: (0, pg_core_1.index)('role_permissions_role_id_idx').on(table.roleId),
    permissionIdIdx: (0, pg_core_1.index)('role_permissions_permission_id_idx').on(table.permissionId),
    rolePermissionUniqueIdx: (0, pg_core_1.index)('role_permissions_role_permission_unique_idx').on(table.roleId, table.permissionId),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    role: one(lookups_schema_1.lookups, {
        fields: [exports.users.roleId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'userRole',
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.users.statusId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'userStatus',
    }),
    userRoles: many(exports.userRoles),
}));
exports.userRolesRelations = (0, drizzle_orm_1.relations)(exports.userRoles, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userRoles.userId],
        references: [exports.users.id],
    }),
    role: one(lookups_schema_1.lookups, {
        fields: [exports.userRoles.roleId],
        references: [lookups_schema_1.lookups.id],
    }),
    assignedByUser: one(exports.users, {
        fields: [exports.userRoles.assignedBy],
        references: [exports.users.id],
        relationName: 'assignedRoles',
    }),
}));
exports.rolePermissionsRelations = (0, drizzle_orm_1.relations)(exports.rolePermissions, ({ one }) => ({
    role: one(lookups_schema_1.lookups, {
        fields: [exports.rolePermissions.roleId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'rolePermissions',
    }),
    permission: one(lookups_schema_1.lookups, {
        fields: [exports.rolePermissions.permissionId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'permissionRole',
    }),
}));
//# sourceMappingURL=users.schema.js.map