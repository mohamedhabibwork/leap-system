import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, decimal, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lookups } from './lookups.schema';
import { users } from './users.schema';

// Plans Table
export const plans = pgTable('plans', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }),
  priceQuarterly: decimal('price_quarterly', { precision: 10, scale: 2 }),
  priceAnnual: decimal('price_annual', { precision: 10, scale: 2 }),
  maxCourses: integer('max_courses'),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('plans_uuid_idx').on(table.uuid),
}));

// Plan Features Table
export const planFeatures = pgTable('plan_features', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  planId: bigserial('plan_id', { mode: 'number' }).references(() => plans.id).notNull(),
  featureId: bigserial('feature_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  featureValue: varchar('feature_value', { length: 255 }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('plan_features_uuid_idx').on(table.uuid),
  planIdx: index('plan_features_plan_id_idx').on(table.planId),
}));

// Subscriptions Table
export const subscriptions = pgTable('subscriptions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  planId: bigserial('plan_id', { mode: 'number' }).references(() => plans.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  billingCycleId: bigserial('billing_cycle_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('subscriptions_uuid_idx').on(table.uuid),
  userIdx: index('subscriptions_userId_idx').on(table.userId),
  planIdx: index('subscriptions_plan_id_idx').on(table.planId),
  statusIdx: index('subscriptions_status_id_idx').on(table.statusId),
}));

// Payment History Table
export const paymentHistory = pgTable('payment_history', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  subscriptionId: bigserial('subscription_id', { mode: 'number' }).references(() => subscriptions.id),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).unique(),
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  paymentDate: timestamp('payment_date', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('payment_history_uuid_idx').on(table.uuid),
  subscriptionIdx: index('payment_history_subscription_id_idx').on(table.subscriptionId),
  userIdx: index('payment_history_userId_idx').on(table.userId),
  invoiceIdx: index('payment_history_invoice_number_idx').on(table.invoiceNumber),
}));

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  planFeatures: many(planFeatures),
  subscriptions: many(subscriptions),
}));

export const planFeaturesRelations = relations(planFeatures, ({ one }) => ({
  plan: one(plans, {
    fields: [planFeatures.planId],
    references: [plans.id],
  }),
  feature: one(lookups, {
    fields: [planFeatures.featureId],
    references: [lookups.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  status: one(lookups, {
    fields: [subscriptions.statusId],
    references: [lookups.id],
  }),
  billingCycle: one(lookups, {
    fields: [subscriptions.billingCycleId],
    references: [lookups.id],
  }),
  paymentHistory: many(paymentHistory),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [paymentHistory.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [paymentHistory.userId],
    references: [users.id],
  }),
  status: one(lookups, {
    fields: [paymentHistory.statusId],
    references: [lookups.id],
  }),
}));
