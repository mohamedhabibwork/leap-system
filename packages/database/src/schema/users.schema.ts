import { pgTable, bigserial, bigint, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lookups } from './lookups.schema';
import { subscriptions } from './subscriptions.schema';

// Users Table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  keycloakUserId: varchar('keycloak_user_id', { length: 255 }).unique(),
  firstName: varchar('firstName', { length: 100 }),
  lastName: varchar('lastName', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  resumeUrl: varchar('resume_url', { length: 500 }),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('en'),
  timezone: varchar('timezone', { length: 50 }),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiry: timestamp('password_reset_expiry', { withTimezone: true }),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  twoFactorTempSecret: varchar('two_factor_temp_secret', { length: 255 }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  twoFactorBackupCodes: text('two_factor_backup_codes'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  isOnline: boolean('isOnline').default(false).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  // Subscription fields
  currentSubscriptionId: bigint('current_subscription_id', { mode: 'number' }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }), // 'active', 'expired', 'cancelled', 'trial', null
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('users_uuid_idx').on(table.uuid),
  emailIdx: index('users_email_idx').on(table.email),
  usernameIdx: index('users_username_idx').on(table.username),
  roleIdx: index('users_role_id_idx').on(table.roleId),
  statusIdx: index('users_status_id_idx').on(table.statusId),
  emailVerificationTokenIdx: index('users_email_verification_token_idx').on(table.emailVerificationToken),
  passwordResetTokenIdx: index('users_password_reset_token_idx').on(table.passwordResetToken),
  keycloakUserIdIdx: index('users_keycloak_user_id_idx').on(table.keycloakUserId),
  subscriptionStatusIdx: index('users_subscription_status_idx').on(table.subscriptionStatus),
  currentSubscriptionIdx: index('users_current_subscription_id_idx').on(table.currentSubscriptionId),
}));

// User Roles Table (many-to-many between users and roles)
export const userRoles = pgTable('user_roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigserial('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  assignedBy: bigserial('assigned_by', { mode: 'number' }).references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdIdx: index('user_roles_user_id_idx').on(table.userId),
  roleIdIdx: index('user_roles_role_id_idx').on(table.roleId),
  userRoleUniqueIdx: index('user_roles_user_role_unique_idx').on(table.userId, table.roleId),
}));

// Role Permissions Table (many-to-many between roles and permissions)
export const rolePermissions = pgTable('role_permissions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id, { onDelete: 'cascade' }).notNull(),
  permissionId: bigserial('permission_id', { mode: 'number' }).references(() => lookups.id, { onDelete: 'cascade' }).notNull(),
  isGranted: boolean('is_granted').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  roleIdIdx: index('role_permissions_role_id_idx').on(table.roleId),
  permissionIdIdx: index('role_permissions_permission_id_idx').on(table.permissionId),
  rolePermissionUniqueIdx: index('role_permissions_role_permission_unique_idx').on(table.roleId, table.permissionId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(lookups, {
    fields: [users.roleId],
    references: [lookups.id],
    relationName: 'userRole',
  }),
  status: one(lookups, {
    fields: [users.statusId],
    references: [lookups.id],
    relationName: 'userStatus',
  }),
  currentSubscription: one(subscriptions, {
    fields: [users.currentSubscriptionId],
    references: [subscriptions.id],
    relationName: 'userCurrentSubscription',
  }),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(lookups, {
    fields: [userRoles.roleId],
    references: [lookups.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
    relationName: 'assignedRoles',
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(lookups, {
    fields: [rolePermissions.roleId],
    references: [lookups.id],
    relationName: 'rolePermissions',
  }),
  permission: one(lookups, {
    fields: [rolePermissions.permissionId],
    references: [lookups.id],
    relationName: 'permissionRole',
  }),
}));
